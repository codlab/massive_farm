import cors from 'cors';
import express, { Express } from "express";
import body_parser from "body-parser";
import { Server } from "http";

import api_v1 from "./server/api_v1";

export default class ApiServer {

  app?: Express;
  server?: Server;

  start() {
    if(this.app) {
      console.log("server already listening");
      return false;
    }
    this.app = express();
  
    this.app
    .use(cors())
    .use(body_parser.json())
    .use("/v1", api_v1);
    
    this.app.listen("8080");

    return true;
  }
}
