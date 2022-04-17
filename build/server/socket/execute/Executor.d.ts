import { Socket } from "socket.io";
import Loggable from "../Loggable";
export declare type Command<I, O> = {
    uuid: string;
    resolve?: (output: O) => void;
    reject?: (error: Error) => void;
    promise: Promise<O>;
};
export declare type CommandAnswerOk<O> = {
    uuid: string;
    result: O;
};
export declare type CommandAnswerError = {
    uuid: string;
    error: string;
};
export declare type CommandAnswer<O> = CommandAnswerOk<O> | CommandAnswerError;
export default class Executor extends Loggable {
    #private;
    reply<Output>(socket: Socket, uuid: string, result: Output): void;
    error(socket: Socket, uuid: string, error: string): void;
    send<Input, Output>(socket: Socket, uuid: string, command: string, params: Input, timeout?: number): Promise<Output>;
    private remove;
    tryUnlock<RESULT>(answer: CommandAnswer<RESULT>): void;
}
