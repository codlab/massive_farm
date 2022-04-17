import AbstractCommand from "../AbstractCommand";
import { ActionInput, KeyValue } from "./ActionInput";
export default class ActionCommand extends AbstractCommand<ActionInput> {
    private id;
    private code;
    private action;
    private options;
    constructor(id: string, code: string, action: string, options: KeyValue[]);
    create(): Promise<ActionInput>;
}
