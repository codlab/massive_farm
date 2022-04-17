import AbstractCommand from "../AbstractCommand";
import { UnlockOutput } from "./UnlockOutput";
export default class UnlockAnswer extends AbstractCommand<UnlockOutput> {
    private id;
    private code;
    constructor(id: string, code: string);
    create(): Promise<UnlockOutput>;
}
