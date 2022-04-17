import AbstractCommand from "../AbstractCommand";
import { UnlockInput } from "./UnlockInput";
export default class UnlockCommand extends AbstractCommand<UnlockInput> {
    private id;
    private code;
    constructor(id: string, code: string);
    create(): Promise<UnlockInput>;
}
