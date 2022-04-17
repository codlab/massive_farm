import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";
import { UnlockOutput } from "./UnlockOutput";

export default class UnlockAnswer extends AbstractCommand<UnlockOutput> {

  public constructor(private id: string, private code: string) {
    super();
  }

  public async create(): Promise<UnlockOutput> {
    const result = await Lock.instance.release(this.id, this.code)
    return { result };
  }
}