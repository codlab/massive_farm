import AbstractCommand from "../AbstractCommand";
import { FileInput } from "./FileInput";
export default class FileCommand extends AbstractCommand<FileInput> {
    private id;
    private code;
    private action;
    private path;
    constructor(id: string, code: string, action: string, path: string);
    create(): Promise<FileInput>;
}
