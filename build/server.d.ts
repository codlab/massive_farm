/// <reference types="express" />
import { Express } from "express";
import { Server } from "http";
export default class ApiServer {
    app?: Express;
    server?: Server;
    start(): boolean;
}
