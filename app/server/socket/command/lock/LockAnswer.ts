import { Client } from "../../../../adb";
import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";

export interface LockOutput {
  result: boolean
}

export default class LockAnswer extends AbstractCommand<LockOutput> {

  public constructor(private client: Client, private id: string, private code: string) {
    super();
  }

  public async create(): Promise<LockOutput> {
    const devices = await this.client.listDevices();
    if (!devices.find(d => d.id == this.id)) throw "invalid device found";

    const result = await Lock.instance.reserve(this.id, this.code)
    return { result };
  }
}