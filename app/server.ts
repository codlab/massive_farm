import express, { Express } from "express";
import body_parser from "body-parser";
import { Server } from "http";
import path from "path";
import http from "http";
import https from "https";
//@ts-ignore
import cors from "cors";
//@ts-ignore
import swaggerGenerator from 'express-swagger-generator';

import APIv1 from "./server/api_v1";
import DiscoveryService, { Mode, OnServerFound } from "./discovery";
import Config, { SocketMaster, SocketSlave } from "./server/Config";
import WebSocketClient from "./server/socket/WebSocketClient";
import WebSocketServer from "./server/socket/WebSocketServer";
import { readFileSync } from "fs";
import { generate } from "./server/doc";

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
    .use(cors())
    .get("/api-docs.json", generate(config))
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

    if (!!config?.server?.swagger) {
      let options = {
        swaggerDefinition: {
            info: {
                description: 'Automatic documentation',
                title: 'My Little Botnet',
                version: '1.0.0',
            },
            host: 'opn0.fr',
            basePath: '/v1',
            produces: [
                "application/json",
                "application/xml"
            ],
            schemes: ['https']
        },
        basedir: __dirname, //app absolute path
        files: ['./server/api_v1.js'] //Path to the API handle folder
      };
      const expressSwagger = swaggerGenerator(this.app);
      expressSwagger(options);
    }


    return true;
  }
}
