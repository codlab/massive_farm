/// <reference path="../../app/adb/adbkit.d.ts" />
import { Device, Properties } from "adbkit";
import Activity from "./Activity";
import { Stream } from "stream";
import _Internal from "./_Internal";
export default class Client extends _Internal {
    private _activity;
    private _client;
    constructor();
    activity(): Activity;
    listDevices(): Promise<Device[]>;
    pull(id: string | Device, filePath: string): Promise<Stream>;
    getProperties(id: string | Device): Promise<Properties>;
}
