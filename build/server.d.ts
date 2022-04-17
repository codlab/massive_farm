/// <reference types="node" />
import express, { Express } from "express";
import { Server } from "http";
import DiscoveryService from "./discovery";
import WebSocketClient from "./server/socket/WebSocketClient";
import WebSocketServer from "./server/socket/WebSocketServer";
interface API {
    router: () => express.Router;
}
export default class ApiServer {
    app?: Express;
    server?: Server;
    api_v1?: API;
    discovery?: DiscoveryService;
    socketClient?: WebSocketClient;
    socketServer?: WebSocketServer;
    start(): boolean;
}
export {};
