import { Client } from "../../../../adb";
import AbstractCommand from "../AbstractCommand";
import { ActionInput, KeyValue } from "./ActionInput";

export default class ActionCommand extends AbstractCommand<ActionInput> {
  public constructor(private id: string, private code: string, private action: string, private options: KeyValue[]) {
    super();
  }

  public async create(): Promise<ActionInput> {
    return {
      id: this.id,
      code: this.code,
      action: this.action,
      options: this.options
    };
  }

}