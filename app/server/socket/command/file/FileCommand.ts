import { Client } from "../../../../adb";
import AbstractCommand from "../AbstractCommand";
import { FileInput } from "./FileInput";

export default class FileCommand extends AbstractCommand<FileInput> {
  public constructor(private id: string, private code: string, private action: string, private path: string) {
    super();
  }

  public async create(): Promise<FileInput> {
    return {
      id: this.id,
      code: this.code,
      action: this.action,
      path: this.path
    };
  }

}