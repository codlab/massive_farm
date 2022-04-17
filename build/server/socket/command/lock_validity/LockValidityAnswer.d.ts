import { Client } from "../../../../adb";
import AbstractCommand from "../AbstractCommand";
export interface LockValidityOutput {
    result: boolean;
}
export default class LockValidityAnswer extends AbstractCommand<LockValidityOutput> {
    private client;
    private id;
    private code;
    constructor(client: Client, id: string, code: string);
    create(): Promise<LockValidityOutput>;
}
