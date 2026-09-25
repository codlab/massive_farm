import { Client } from "../../../../adb";
import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";

const ADB_TCP_PORT = 5555;

export interface LockOutput {
  result: boolean,
  // address to use with `adb connect`, when the device is reachable over wifi
  adb?: string
}

export default class LockAnswer extends AbstractCommand<LockOutput> {

  public constructor(private client: Client, private id: string, private code: string) {
    super();
  }

  public async create(): Promise<LockOutput> {
    const devices = await this.client.listDevices();
    if (!devices.find(d => d.id == this.id)) throw "invalid device found";

    const result = await Lock.instance.reserve(this.id, this.code)
    return { result, adb: await this.enableTcp() };
  }

  private async enableTcp(): Promise<string|undefined> {
    try {
      const ip = await this.client.getIp(this.id);
      if (!ip) return undefined;
      await this.client.tcpip(this.id, ADB_TCP_PORT);
      return `${ip}:${ADB_TCP_PORT}`;
    } catch(err) {
      console.error(`enable tcp for ${this.id}`, err);
      return undefined;
    }
  }
}