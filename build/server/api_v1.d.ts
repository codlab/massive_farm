/// <reference types="express" />
import { Router } from "express";
export default class APIv1 {
    private _router;
    constructor();
    private getFile(id, filePath);
    private createFile(url, path);
    private createAction(url, action, options?);
    private initDevices();
    private initRoutes();
    router: () => Router;
}
