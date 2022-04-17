import { LockValidityInput } from './command/lock_validity/LockValidityInput';
import { Socket } from "socket.io";
//@ts-ignore
import io from "socket.io-client";
import { uuid } from "uuidv4";
import { ClientCommand } from "./execute/ClientCommand";
import Executor, { CommandAnswer } from "./execute/Executor";
import Loggable from "./Loggable";
import DevicesAnswer from './command/devices/DevicesAnswer';
import { Client } from '../../adb';
import { LockInput } from './command/lock/LockInput';
import { UnlockInput } from './command/unlock/UnlockInput';
import LockAnswer from './command/lock/LockAnswer';
import UnlockAnswer from './command/unlock/UnlockAnswer';
import LockValidityAnswer from './command/lock_validity/LockValidityAnswer';
import { ActionInput } from './command/action/ActionInput';
import ActionAnswer from './command/action/ActionAnswer';
import { FileInput } from './command/file/FileInput';
import FileAnswer from './command/file/FileAnswer';


export default class WebSocketClient extends Loggable {
  #socket: Socket;
  #id = uuid();
  #executor = new Executor();
  #client: Client = new Client();

  constructor(private master: string) {
    super();

    this.#socket = io(master);

    this.#socket.on("connect", () => this.onConnect());

    this.#socket.on("answer", (data: CommandAnswer<string>) => {
      this.log(`receiving data -> `, data);
      this.#executor.tryUnlock(data);
    });

    this.#socket.on("command", (input: ClientCommand<any>) => this.onCommandReceived(input));
  }

  private async onCommandReceived(input: ClientCommand<any>) {
    this.log(`receiving command`, input);

    const { uuid, command, data } = input;

    try {
      switch(command) {
        case "devices": {
            const command = new DevicesAnswer(this.#client);
            const devices = await command.create();
            this.#executor.reply(this.#socket, uuid, devices);
        }; break;
        case "lock": {
          this.log("received command for locking");
          const input = (<unknown> data) as LockInput;
          const command = new LockAnswer(this.#client, input?.id, input?.code);
          const result = await command.create();
          this.#executor.reply(this.#socket, uuid, result);
        }; break;
        case "unlock": {
          this.log("received command for unlocking");
          const input = (<unknown> data) as UnlockInput;
          const command = new UnlockAnswer(input?.id, input?.code);
          const result = await command.create();
          this.#executor.reply(this.#socket, uuid, result);
        }; break;
        case "lock_validity": {
          this.log("received command for checking lock validity");
          const input = (<unknown> data) as LockValidityInput;
          const command = new LockValidityAnswer(this.#client, input?.id, input?.code);
          const result = await command.create();
          this.#executor.reply(this.#socket, uuid, result);
        }; break;
        case "action": {
          this.log("received command for action on device");
          const input = (<unknown> data) as ActionInput;
          const command = new ActionAnswer(this.#client, input?.id, input?.code, input?.action, input?.options || []);
          const result = await command.create();
          this.log("action result : ", result);
          this.#executor.reply(this.#socket, uuid, result);
        }; break;
        case "file": {
          this.log("received command for file pulling on device");
          const input = (<unknown> data) as FileInput;
          const command = new FileAnswer(this.#client, input?.id, input?.code, input?.action, input?.path);
          const result = await command.create();
          this.log("file result : ", result);
          this.#executor.reply(this.#socket, uuid, result);
        }; break;
        default: throw `unknown command ${command}`;
      }
    } catch(err) {
      this.log("onCommandreceived error", err);
      this.#executor.error(this.#socket, uuid, `${err}`);
    }
}

  private async onConnect() {
    try {
      const result = await this.#executor.send(this.#socket, uuid(), "register", { register: true, uuid: this.#id });
      this.log(`connection to ${this.master} result`, result);
    } catch(err) {
      this.log(`failed connect register to ${this.master}`, err);
    }
  }
}