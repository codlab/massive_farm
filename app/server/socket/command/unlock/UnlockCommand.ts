import AbstractCommand from "../AbstractCommand";
import { UnlockInput } from "./UnlockInput";

export default class UnlockCommand extends AbstractCommand<UnlockInput> {

  public constructor(private id: string, private code: string) {
    super();
  }

  public async create(): Promise<UnlockInput> {
    return {
      id: this.id,
      code: this.code
    };
  }
}