import { Router } from "express";
import WebSocketServer from "./socket/WebSocketServer";
export default class APIv1 {
    private commandScheduler;
    private _router;
    constructor(commandScheduler: WebSocketServer);
    private createFile;
    private createAction;
    private initDevices;
    private initRoutes;
    router: () => Router;
}
