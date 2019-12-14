import express, { Express } from "express";
import body_parser from "body-parser";
import { Server } from "http";

import APIv1 from "./server/api_v1";

export default class ApiServer {

  app?: Express;
  server?: Server;
  api_v1: APIv1 = new APIv1();

  start() {
    if(this.app) {
      console.log("server already listening");
      return false;
    }
    this.app = express();
  
    this.app
    .use(body_parser.json())
    .use("/v1", this.api_v1.router());
    
    this.app.listen("8080");

    return true;
  }
}
