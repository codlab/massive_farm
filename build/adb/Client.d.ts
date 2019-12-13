import Activity from "./Activity";
import { Stream } from "stream";
import _Internal, { Device } from "./_Internal";
export interface Properties {
    "ro.product.brand": string;
    "ro.product.manufacturer": string;
    "ro.product.model": string;
}
export default class Client extends _Internal {
    private _activity;
    private _client;
    constructor();
    activity(): Activity;
    listDevices(): Promise<Device[]>;
    pull(id: string | Device, filePath: string): Promise<Stream>;
    getProperties(id: string | Device): Promise<Properties>;
}
