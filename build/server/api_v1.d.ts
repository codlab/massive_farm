import { Router } from "express";
import WebSocketServer from "./socket/WebSocketServer";
export default class APIv1 {
    private commandScheduler;
    private _router;
    constructor(commandScheduler: WebSocketServer);
    private createFile;
    private createAction;
    /**
     * List of available devices
     * @route GET /devices.json
     * @group devices - List devices
     * @returns {object} 200 - Result
     * @returns {Error}  default - Unexpected error
     */
    private initDevices;
    private initRoutes;
    router: () => Router;
}
