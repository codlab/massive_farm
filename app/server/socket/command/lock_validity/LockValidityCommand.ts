import AbstractCommand from "../AbstractCommand";
import { LockValidityInput } from "./LockValidityInput";

export default class LockValidityCommand extends AbstractCommand<LockValidityInput> {

  public constructor(private id: string, private code: string) {
    super();
  }

  public async create(): Promise<LockValidityInput> {
    return {
      id: this.id,
      code: this.code
    };
  }
}