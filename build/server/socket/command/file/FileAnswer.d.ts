import { Client } from "../../../../adb";
import AbstractCommand from "../AbstractCommand";
export interface FileOutput {
    result: boolean;
}
export default class FileAnswer extends AbstractCommand<FileOutput> {
    private client;
    private id;
    private code;
    private action;
    private path;
    constructor(client: Client, id: string, code: string, action: string, path: string);
    create(): Promise<FileOutput>;
    private getFile;
}
