import { Client } from "../../../../adb";
import AbstractCommand from "../AbstractCommand";
import { KeyValue } from "./ActionInput";
export interface ActionOutput {
    result: boolean;
}
export default class ActionAnswer extends AbstractCommand<ActionOutput> {
    private client;
    private id;
    private code;
    private action;
    private options;
    constructor(client: Client, id: string, code: string, action: string, options: KeyValue[]);
    create(): Promise<ActionOutput>;
}
