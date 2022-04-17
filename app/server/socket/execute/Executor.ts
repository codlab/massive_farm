import { Socket } from "socket.io";
//@ts-ignore
import io from "socket.io-client";
import { uuid } from "uuidv4";
import Loggable from "../Loggable";

export type Command<I, O> = {
  uuid: string,
  resolve?: (output: O) => void,
  reject?: (error: Error) => void,
  promise: Promise<O>,
}

export type CommandAnswerOk<O> = {
  uuid: string,
  result: O,
}

export type CommandAnswerError = {
  uuid: string,
  error: string
}

export type CommandAnswer<O> = CommandAnswerOk<O>|CommandAnswerError;

export default class Executor extends Loggable {
  #commands: Map<string, Command<any, any>> = new Map();

  public reply<Output>(socket: Socket, uuid: string, result: Output) {
    socket.emit("answer", { uuid, result});
  }

  public error(socket: Socket, uuid: string, error: string) {
    socket.emit("answer", { uuid, error});
  }

  public send<Input, Output>(socket: Socket, uuid: string, command: string, params: Input, timeout: number = 60000): Promise<Output> {
    const pending: Command<Input, Output> = { uuid, command } as any;
    pending.promise = new Promise((resolve, reject) => {
      this.log("promise created for socket", params);
      pending.resolve = resolve;
      pending.reject = reject;
  
      socket.emit("command", { uuid, command, data: params});
    });
  

    setTimeout(() => {
      if (!pending.resolve || !pending.reject) return;

      this.log("Timeout for", {params, pending});
      pending.reject(Object.assign(new Error("Timeout call"), { params, pending }));
      this.remove(pending);
    }, timeout);

    this.#commands.set(pending.uuid, pending);

    return pending.promise;
  }

  private remove(pending: Command<any, any>) {
    this.log(`cleaning ${pending.uuid}`);

    pending.reject = undefined;
    pending.resolve = undefined;

    this.#commands.delete(pending.uuid);
  }

  public tryUnlock<RESULT>(answer: CommandAnswer<RESULT>) {
    const { uuid } = answer;

    const pending = this.#commands.get(uuid);

    if (!pending?.reject || !pending?.resolve) return;

    const error = answer as CommandAnswerError;
    const ok = answer as CommandAnswerOk<RESULT>;

    if (error?.error) {
      this.log(`tryUnlock failed for ${pending.uuid}`, answer);
      pending.reject(Object.assign(new Error("Error call " + error?.error), { pending }));
    } else {
      this.log(`tryUnlock success for ${pending.uuid}`, answer);
      pending.resolve(ok?.result);
    }

    this.remove(pending);
  }
}