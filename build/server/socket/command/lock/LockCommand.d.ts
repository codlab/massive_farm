import AbstractCommand from "../AbstractCommand";
import { LockInput } from "./LockInput";
export default class LockCommand extends AbstractCommand<LockInput> {
    private id;
    private code;
    constructor(id: string, code: string);
    create(): Promise<LockInput>;
}
