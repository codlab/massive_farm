/// <reference types="express" />
import { Express } from "express";
import { Server } from "http";
import APIv1 from "./server/api_v1";
import DiscoveryService from "./discovery";
export default class ApiServer {
    app?: Express;
    server?: Server;
    api_v1: APIv1;
    discovery?: DiscoveryService;
    start(): boolean;
}
