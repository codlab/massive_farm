import { Router } from "express";
export default class APIv1Router {
    private _router;
    private servers;
    constructor();
    onServer(address: string, port: number): void;
    private refreshServerInfo;
    private safeDevices;
    private createFile;
    private createAction;
    private findServer;
    private initDevices;
    private initRoutes;
    router: () => Router;
}
