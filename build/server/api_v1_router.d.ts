/// <reference types="express" />
import { Router } from "express";
export default class APIv1Router {
    private _router;
    private servers;
    constructor();
    onServer(address: string, port: number): void;
    private refreshServerInfo(server);
    private safeDevices(server);
    private createFile(url, path);
    private createAction(url, action, options?);
    private findServer(deviceId);
    private initDevices();
    private initRoutes();
    router: () => Router;
}
