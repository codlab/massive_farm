import AbstractCommand from "../AbstractCommand";
import { LockInput } from "./LockInput";

export default class LockCommand extends AbstractCommand<LockInput> {

  public constructor(private id: string, private code: string) {
    super();
  }

  public async create(): Promise<LockInput> {
    return {
      id: this.id,
      code: this.code
    };
  }
}