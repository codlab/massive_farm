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
    send<Input, Output>(socket: Socket, params: Input, timeout?: number): Command<Input, Output>;
    private remove;
    tryUnlock<RESULT>(answer: CommandAnswer<RESULT>): void;
}
