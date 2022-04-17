import { Client } from "../../../../adb";
import AbstractCommand from "../AbstractCommand";
import { DeviceInfo } from "./DeviceInfo";
export interface DevicesOutput {
    devices: DeviceInfo[];
}
export default class DevicesAnswer extends AbstractCommand<DevicesOutput> {
    private client;
    constructor(client: Client);
    create(): Promise<DevicesOutput>;
    private getProperties;
}
