import { Client } from "../../../../adb";
import AbstractCommand from "../AbstractCommand";
export interface LockOutput {
    result: boolean;
}
export default class LockAnswer extends AbstractCommand<LockOutput> {
    private client;
    private id;
    private code;
    constructor(client: Client, id: string, code: string);
    create(): Promise<LockOutput>;
}
