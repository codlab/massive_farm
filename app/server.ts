import express, { Express } from "express";
import body_parser from "body-parser";
import { Server } from "http";
import path from "path";
import http from "http";
import https from "https";

import APIv1 from "./server/api_v1";
import DiscoveryService, { Mode, OnServerFound } from "./discovery";
import Config, { SocketMaster, SocketSlave } from "./server/Config";
import WebSocketClient from "./server/socket/WebSocketClient";
import WebSocketServer from "./server/socket/WebSocketServer";
import { readFileSync } from "fs";

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

    const httpsConfiguration = config?.server?.https;
    const socket = config?.server?.socket;
    const master = socket as SocketMaster;
    const client = socket as SocketSlave;
    const port = master?.port || 9999;
    this.socketServer = new WebSocketServer(port);
    this.socketClient = new WebSocketClient(client?.url || `http://127.0.0.1:${port}`);

    const mode: Mode = config?.server?.mode || null;

    this.app = express();

    this.api_v1 = new APIv1(this.socketServer);


    this.app
    .use(express.static(path.join(__dirname, '../public')))
    .use(body_parser.json())
    .use("/v1", this.api_v1.router());
    //this.app.listen(config?.server?.port || 8080);

    if (httpsConfiguration && !!httpsConfiguration.use) {
      const credentials = {
        key: undefined,
        cert: undefined,
        ca: undefined
      };

      [ "key", "cert", "ca"].forEach(key => {
        if (!!httpsConfiguration[key]) credentials[key] = readFileSync(httpsConfiguration[key]);
      });

      this.server = https.createServer(credentials, this.app);
    } else {
      this.server = http.createServer(this.app);
    }
    
    const serverPort = config?.server?.port || 8080;
    this.server.listen(serverPort, () => {
      console.log(`web server running at ${serverPort}`);
    });

    if (!!(config?.server?.discovery)) {
      this.discovery = new DiscoveryService(undefined, mode);
      this.discovery.bind();
    }    

    return true;
  }
}
