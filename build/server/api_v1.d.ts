/// <reference types="express" />
import { Router } from "express";
import { Properties } from "adbkit";
export default class APIv1 {
    private _router;
    constructor();
    private getFile(id, filePath);
    private createFile(url, path);
    private createAction(url, action, options?);
    getProperties(deviceId: string): Promise<Properties>;
    private initDevices();
    private initRoutes();
    router: () => Router;
}
