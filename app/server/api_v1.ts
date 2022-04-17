import { KeyValue } from './socket/command/action/ActionInput';
import { Router } from "express";
import { IncomingHttpHeaders } from "http";
import { Client, Activity } from "../adb";
import Config, { RouteFile, RouteAction, Option } from "./Config";
import WebSocketServer from "./socket/WebSocketServer";

const config: Config = require("../../config.json");

interface Req {
  headers: IncomingHttpHeaders
}

const client: Client = new Client();
const activity: Activity = client.activity();

export default class APIv1 {

  private _router: Router;
  constructor(private commandScheduler: WebSocketServer) {
    commandScheduler.setConfiguration(config.activity, config.routes);
    this._router = Router();

    this.initDevices();
    this.initRoutes();
  }

  private createFile(url: string, path: string) {
    console.log(`create file action on ${url} for path ${path}`);
    this._router.get(url, async (req, res) => {
      try {
        const { id } = req.params;
        const { code } = req.query;

        if (typeof code !== "string") throw "invalid code type";

        console.log("file ->> ", {code, id});
        const valid = await this.commandScheduler.forwardLockValidity(id, code);
        if(!valid?.result)  throw "invalid session";

        const result = await this.commandScheduler.forwardFileCommand(id, code, config.activity.action, path)
        return res.json(result);
      } catch(err) {
        console.error(err);
        return res.status(404).json({error: `${err}`})
      }
    });
  }
  
  private createAction(url: string, action: string, options?: Option[]) {
    console.log(`create intent action on ${url} for action ${action}`);
    this._router.get(url, async (req, res) => {
      try {
        const { id } = req.params;
        const { code } = req.query;

        if (typeof code !== "string") throw "invalid code type";

        console.log("action params ->> ", {code, id});
        const valid = await this.commandScheduler.forwardLockValidity(id, code);
        if(!valid?.result)  throw "invalid session";

        const keyValues: KeyValue[] = options?.map(({key, def}) => {
          const value = req.query[key] || def;
          if (typeof value !== "string") return { key, value: null};
          return { key, value };
        }) || [];

        console.log("starting activity for ", {id, code, action: config.activity.action, keyValues});

        const result = await this.commandScheduler.forwardActionCommand(id, code, config.activity.action, keyValues)

        return res.json(result)
      } catch(err) {
        console.error(err);
        return res.status(400).json({error: `${err}`})
      }
    });
  }

  private initDevices() {
    this._router.get("/devices.json", async (req, res) => {
      try {
        const output = await this.commandScheduler.forwardDevices();
        return res.json(output.devices);
      } catch(err) {
        console.warn(err);
        return res.status(400).json({});
      }
    });

    this._router.all("/:id/lock.json", async (req, res) => {
      try {
        var { id } = req.params;
        var code = req?.body?.code;
        if (!code) code = req?.query?.code;

        if(!code || !id) throw "can't hold";

        const result = await this.commandScheduler.forwardLock(id, code);
        return res.json(result);
      } catch(err) {
        return res.status(400).json({ error: `${err}` });
      }
    });

    this._router.all("/:id/unlock.json", async (req, res) => {
      try {
        var { id } = req.params;
        var code = req?.body?.code;
        if (!code) code = req?.query?.code;

        if(!code || !id) throw "can't release";

        const result = await this.commandScheduler.forwardUnlock(id, code);
        return res.json(result);
      } catch(err) {
        return res.status(400).json({ error: `${err}` });
      }
    });
  }

  private initRoutes() {
    config.routes && config.routes.forEach(route => {
      if((route as RouteFile).path) {
        this.createFile(route.url, (route as RouteFile).path);
      } else if((route as RouteAction).action) {
        const action = route as RouteAction;
        this.createAction(route.url, action.action, action.options);
      } else {
        console.log("unknown action ", route);
      }
    });
  }

  public router = () => this._router;
}
