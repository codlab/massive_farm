import { ActionOutput } from './command/action/ActionAnswer';
import { ActionInput, KeyValue } from './command/action/ActionInput';
import { LockValidityInput } from './command/lock_validity/LockValidityInput';
import SocketIO, { Server, Socket } from "socket.io";
import { uuid } from "uuidv4";
import { DevicesOutput } from "./command/devices/DevicesAnswer";
import DevicesCommand, { DevicesInput } from "./command/devices/DevicesCommand";
import { LockOutput } from "./command/lock/LockAnswer";
import LockCommand from "./command/lock/LockCommand";
import { LockInput } from "./command/lock/LockInput";
import UnlockCommand from "./command/unlock/UnlockCommand";
import { UnlockInput } from "./command/unlock/UnlockInput";
import { UnlockOutput } from "./command/unlock/UnlockOutput";
import { ClientCommand } from "./execute/ClientCommand";
import Executor, { CommandAnswer, CommandAnswerError, CommandAnswerOk } from "./execute/Executor";
import Loggable from "./Loggable";
import { LockValidityOutput } from './command/lock_validity/LockValidityAnswer';
import { Activity, Route } from '../Config';
import ActionCommand from './command/action/ActionCommand';
import { FileInput } from './command/file/FileInput';
import { FileOutput } from './command/file/FileAnswer';
import FileCommand from './command/file/FileCommand';
import DeviceRouter from './DeviceRouter';

function id(socket: Socket): string|undefined|null {
  return (socket as any).customUuid;
}

function slaveId(socket: Socket): string|undefined|null {
  return (socket as any).slaveUuid;
}

export default class WebSocketServer extends Loggable {
  #server: Server;
  #sockets: Map<string, Socket> = new Map();
  #slaves: Map<string, Socket> = new Map();
  #router = new DeviceRouter(this.#slaves, () => this.forwardDevices());

  #executor = new Executor();

  // configuration
  #routes: Route[] = [];
  #activity: Activity = { action: ""};

  constructor(private port: number) {
    super();

    this.#server = SocketIO(port);

    this.#server.on("connection", async (socket) => {
      try {
        if (!!id(socket)) return;

        socket.on("disconnect", () => {
          const _uuid = id(socket);
          if (!_uuid) return;
          this.log(`removing disconnected ${_uuid}`);
          this.#sockets.delete(_uuid);

          // only remove the slave entry if it still belongs to this socket (it may have reconnected meanwhile)
          const _slaveUuid = slaveId(socket);
          if (_slaveUuid && this.#slaves.get(_slaveUuid) === socket) {
            this.#slaves.delete(_slaveUuid);
          }
        });

        socket.on("command", (input: ClientCommand<any>) => this.onCommandReceivedForSocket(socket, input));

        socket.on("answer", (command: CommandAnswer<any>) => {
          this.log("having data ->", command);
          try {
            this.#executor.tryUnlock(command);
          } catch(err) {
            this.log(`dropping call for data`, err);
            socket.emit("answer", { uuid: command?.uuid, error: `command rejected for ${id(socket)}` });
          }
        });

        (socket as any).customUuid = uuid();
        const _uuid = id(socket);
        !!_uuid && this.#sockets.set(_uuid, socket);

        this.log(`connection from socket ${id(socket)}`);
      } catch(err) {
        this.log(`failed to register a socket`, err);
      }
    });
  }

  public setConfiguration(activity: Activity, routes: Route[]) {
    this.#activity = activity;
    this.#routes = routes;
  }

  private async onCommandReceivedForSocket<Input>(socket: Socket, input: ClientCommand<Input>): Promise<void> {
    const { command, uuid, data} = input;
    this.log("onCommandReceivedForSocket", input);
    try {
      const result = await this.onCommandReceived<Input>(input, socket);
      const answer = this.answer<DevicesOutput>(socket, { uuid, result});
    } catch(err) {
      this.log(`dropping call for register, socket is already known`, command);
      socket.emit("answer", { uuid, error: `command rejected for ${id(socket)}`} );
    }
  }

  public async onCommandReceived<Input>(input: ClientCommand<Input>, socket?: Socket): Promise<any> {
    const { command, uuid, data} = input;

    this.log("onCommandReceived", input);
    switch(command) {
      case "register": {
        if (!socket) throw "register but without socket";
        this.log("having data", command);
        const decoded = data as any;
        if (!decoded?.register || !decoded?.uuid) throw "invalid register info";
        const sock = this.#slaves.get(decoded.uuid);
        if (sock && sock !== socket && sock.connected) {
          throw "dropping call for register, socket is already known";
        }

        (socket as any).slaveUuid = decoded.uuid;
        this.#slaves.set(decoded.uuid, socket);
        return {
          message: `command valid for ${id(socket)}`,
          activity: this.#activity,
          routes: this.#routes
        };
      }
      case "devices": {
        this.log("received command for devices");
        return this.forwardDevices();
      }
      case "lock": {
        this.log("received command for locking");
        const input = (<unknown> data) as LockInput;
        return this.forwardLock(input.id, input.code);
      }
      case "unlock": {
        this.log("received command for unlocking");
        const input = (<unknown> data) as UnlockInput;
        return this.forwardUnlock(input.id, input.code);
      }
      case "lock_validity": {
        this.log("received command for lock validity");
        const input = (<unknown> data) as LockValidityInput;
        return this.forwardLockValidity(input.id, input.code);
      }
      case "action": {
        this.log("received action command for device");
        const input = (<unknown> data) as ActionInput;
        return this.forwardActionCommand(input.id, input.code, input.action, input.options);
      }
      case "file": {
        this.log("received file command for device");
        const input = (<unknown> data) as FileInput;
        return this.forwardFileCommand(input.id, input.code, input.action, input.path);
      }
    }

    throw `${command} not managed`
  }

  private answer<Output>(socket: Socket, answer: CommandAnswerOk<Output>|CommandAnswerError) {
    return socket.emit("answer", answer);
  }

  public async forwardDevices(): Promise<DevicesOutput> {
    this.log("forwardDevices");
    const slaves = [...this.#slaves.entries()];
    const outputs = await Promise.all(slaves.map(([_, s]) => this.devices(s)));
    const output: DevicesOutput = { devices: [] };
    outputs.forEach(o => {
      o.devices.forEach(d => output.devices.push(d));
    });

    this.#router.update(slaves.map(([slaveUuid], index) => ({ slaveUuid, devices: outputs[index].devices })));
    return output;
  }

  public async forwardUnlock(id: string, code: string): Promise<LockOutput> {
    this.log("forwardUnlock");
    return this.#router.route(id, s => this.unlock(s, id, code));
  }

  public async unlock(socket: Socket, id: string, code: string): Promise<LockOutput> {
    try {
      const command = new UnlockCommand(id, code);
      const input = await command.create();
      return await this.#executor.send<UnlockInput, UnlockOutput>(socket, uuid(), "unlock", input);
    } catch(err) {
      this.log("error while unlocking device", err);
      return { result: false };
    }
  }

  public async forwardLock(id: string, code: string): Promise<LockOutput> {
    this.log("forwardLock");
    return this.#router.route(id, s => this.lock(s, id, code));
  }

  public async lock(socket: Socket, id: string, code: string): Promise<LockOutput> {
    try {
      const command = new LockCommand(id, code);
      const input = await command.create();
      return await this.#executor.send<LockInput, LockOutput>(socket, uuid(), "lock", input);
    } catch(err) {
      this.log("error while locking device", err);
      return { result: false };
    }
  }

  public async forwardLockValidity(id: string, code: string): Promise<LockValidityOutput> {
    this.log("forwardLockValidity");
    return this.#router.route(id, s => this.lockValidity(s, id, code));
  }

  public async lockValidity(socket: Socket, id: string, code: string): Promise<LockValidityOutput> {
    try {
      const command = new LockCommand(id, code);
      const input = await command.create();
      return await this.#executor.send<LockValidityInput, LockValidityOutput>(socket, uuid(), "lock_validity", input);
    } catch(err) {
      this.log("error while checking lock validity for device", err);
      return { result: false };
    }
  }

  public async forwardActionCommand(id: string, code: string, action: string, options: KeyValue[]): Promise<LockOutput> {
    this.log("forwardActionCommand");
    return this.#router.route(id, s => this.action(s, id, code, action, options));
  }

  public async action(socket: Socket, id: string, code: string, action: string, options: KeyValue[]): Promise<LockOutput> {
    try {
      const command = new ActionCommand(id, code, action, options);
      const input = await command.create();
      return await this.#executor.send<ActionInput, ActionOutput>(socket, uuid(), "action", input);
    } catch(err) {
      this.log("error while unlocking device", err);
      return { result: false };
    }
  }

  public async forwardFileCommand(id: string, code: string, action: string, path: string): Promise<FileOutput> {
    this.log("forwardFileCommand");
    return this.#router.route(id, s => this.file(s, id, code, action, path));
  }

  public async file(socket: Socket, id: string, code: string, action: string, path: string): Promise<FileOutput> {
    try {
      const command = new FileCommand(id, code, action, path);
      const input = await command.create();
      return await this.#executor.send<FileInput, FileOutput>(socket, uuid(), "file", input);
    } catch(err) {
      this.log("error while pulling file from device", err);
      return { result: false };
    }
  }

  public async devices(socket: Socket): Promise<DevicesOutput> {
    try {
      const command = new DevicesCommand();
      const input = await command.create();
      return await this.#executor.send<DevicesInput, DevicesOutput>(socket, uuid(), "devices", input);
    } catch(err) {
      this.log("error while looking for device", err);
      return {devices: []};
    }
  }

}