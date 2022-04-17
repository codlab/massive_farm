import AbstractCommand from "../AbstractCommand";
import { LockValidityInput } from "./LockValidityInput";
export default class LockValidityCommand extends AbstractCommand<LockValidityInput> {
    private id;
    private code;
    constructor(id: string, code: string);
    create(): Promise<LockValidityInput>;
}
