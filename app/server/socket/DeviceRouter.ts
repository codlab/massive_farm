import { Socket } from "socket.io";
import { DeviceInfo } from "./command/devices/DeviceInfo";
import Loggable from "./Loggable";

export type SlaveDevices = {
  slaveUuid: string,
  devices: DeviceInfo[],
}

export default class DeviceRouter extends Loggable {
  // device id -> uuid of the slave exposing it
  #owners: Map<string, string> = new Map();

  constructor(private slaves: Map<string, Socket>, private refresh: () => Promise<unknown>) {
    super();
  }

  public update(listing: SlaveDevices[]) {
    const owners: Map<string, string> = new Map();
    listing.forEach(({ slaveUuid, devices }) => {
      devices.forEach(d => {
        if (!d.id) return;
        if (owners.has(d.id)) this.log(`device ${d.id} is exposed by multiple slaves, using ${slaveUuid}`);
        owners.set(d.id, slaveUuid);
      });
    });

    this.#owners = owners;
  }

  // send the command to the slave exposing the device, falling back to every slave when none is known
  public async route<Output extends { result: any }>(deviceId: string, call: (socket: Socket) => Promise<Output>): Promise<Output> {
    const cached = this.owner(deviceId);
    let output: Output|undefined;
    if (cached) {
      output = await call(cached);
      if (output?.result) return output;
    }

    // unknown device or failed call : the device may have moved, refresh the owners
    await this.refresh();
    const owner = this.owner(deviceId);
    if (owner && owner === cached && output) return output;
    if (owner) return call(owner);

    // no slave exposes it anymore (e.g. unplugged while locked), the lock may still be held somewhere
    const outputs = await Promise.all([...this.slaves.values()].map(call));
    return outputs.find(o => !!o?.result) || output || outputs[0] || ({ result: false } as Output);
  }

  private owner(deviceId: string): Socket|undefined {
    const slaveUuid = this.#owners.get(deviceId);
    const socket = slaveUuid ? this.slaves.get(slaveUuid) : undefined;
    return socket?.connected ? socket : undefined;
  }
}
