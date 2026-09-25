import { Client } from "../../../../adb";
import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";
import { UnlockOutput } from "./UnlockOutput";

export default class UnlockAnswer extends AbstractCommand<UnlockOutput> {

  public constructor(private client: Client, private id: string, private code: string) {
    super();
  }

  public async create(): Promise<UnlockOutput> {
    const result = await Lock.instance.release(this.id, this.code)
    await this.disableTcp();
    return { result };
  }

  private async disableTcp() {
    try {
      await this.client.usb(this.id);
    } catch(err) {
      console.error(`disable tcp for ${this.id}`, err);
    }
  }
}