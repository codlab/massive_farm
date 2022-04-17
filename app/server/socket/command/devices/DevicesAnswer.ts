//@ts-ignore
import { Properties } from "adbkit";
import { Client } from "../../../../adb";
import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";
import { DeviceInfo } from "./DeviceInfo";

export interface DevicesOutput {
  devices: DeviceInfo[];
}

export default class DevicesAnswer extends AbstractCommand<DevicesOutput> {
  public constructor(private client: Client) {
    super();
  }

  public async create(): Promise<DevicesOutput> {
    const devices = await this.client.listDevices();
    const properties = await Promise.all(devices.map(d => this.getProperties(d.id)));

    const lock: Lock = Lock.instance;
    var props:any = properties.map(p => {
      return {
        "brand": p["ro.product.brand"],
        "manufacturer": p["ro.product.manufacturer"],
        "model": p["ro.product.model"],
      }
    });

    return {
      devices: devices.map((device, index) => ({
        ...device,
        infos: index < props.length ? props[index]: {},
        available: lock.available(device.id || "")
      }))
    };
  }

  private async getProperties(deviceId: string): Promise<Properties> {
    try {
      return await this.client.getProperties(deviceId);
    } catch(err) {
      console.error(`get properties for ${deviceId}`, err);
      return {};
    }
  }

}