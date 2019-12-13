import adb from "adbkit";
import Activity from "./Activity";
import { Stream } from "stream";
import _Internal, { Device } from "./_Internal";

export interface Properties {
    "ro.product.brand": string,
    "ro.product.manufacturer": string,
    "ro.product.model": string,
}

export default class Client extends _Internal {

    private _activity: Activity;
    private _client: any;

    constructor() {
        super();
        this._client = adb.createClient();
        this._activity = new Activity(this._client);
    }

    activity() {
        return this._activity;
    }

    listDevices(): Promise<Device[]> {
        return this._client.listDevices();
    }

    pull(id: string|Device, filePath: string): Promise<Stream> {

        return this._client.pull(this.id(id), filePath);
    }

    getProperties(id: string|Device): Promise<Properties> {

        return this._client.getProperties(this.id(id));
    }
}