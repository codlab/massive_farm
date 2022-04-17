import { Client } from "../../../../adb";
import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";

export interface LockValidityOutput {
  result: boolean
}

export default class LockValidityAnswer extends AbstractCommand<LockValidityOutput> {

  public constructor(private client: Client, private id: string, private code: string) {
    super();
  }

  public async create(): Promise<LockValidityOutput> {
    const devices = await this.client.listDevices();
    if (!devices.find(d => d.id == this.id)) throw "invalid device found";

    const result = Lock.instance.valid(this.id, this.code)
    return { result };
  }
}