import express, { Express } from "express";
import body_parser from "body-parser";
import { Server } from "http";

import APIv1 from "./server/api_v1";
import APIv1Router from "./server/api_v1_router";
import DiscoveryService, { Mode, OnServerFound } from "./discovery";
import Config, { SocketMaster, SocketSlave } from "./server/Config";
import WebSocketClient from "./server/socket/WebSocketClient";
import WebSocketServer from "./server/socket/WebSocketServer";

const config: Config = require("../config.json");

interface API {
  router: () => express.Router
};

export default class ApiServer {

  app?: Express;
  server?: Server;
  api_v1?: API;
  discovery?: DiscoveryService;

  socketClient?: WebSocketClient;
  socketServer?: WebSocketServer;

  start() {
    if(this.app) {
      console.log("server already listening");
      return false;
    }

    const socket = config?.server?.socket;
    const master = socket as SocketMaster;
    const client = socket as SocketSlave;
    const port = master?.port || 9999;
    this.socketServer = new WebSocketServer(port);
    this.socketClient = new WebSocketClient(client?.url || `http://127.0.0.1:${port}`);

    const mode: Mode = config?.server?.mode || null;

    this.app = express();

    /*if("master" == mode) {
      const api: APIv1Router = new APIv1Router();
      this.api_v1 = api;
      var callback: OnServerFound|null = (address, port) => {
        api.onServer(address, port);
      };
      this.discovery = new DiscoveryService(callback, mode);
    } else */
    {
      this.api_v1 = new APIv1(this.socketServer);
      this.discovery = new DiscoveryService(undefined, mode);
    }

    this.app
    .use(body_parser.json())
    .use("/v1", this.api_v1.router());
    this.app.listen("8080");

    this.discovery.bind();
    

    return true;
  }
}
