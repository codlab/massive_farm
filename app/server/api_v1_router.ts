import { Router } from "express";
import { IncomingHttpHeaders } from "http";
import { Client, Activity } from "../adb";
import Config, { RouteFile, RouteAction, Option } from "./Config";
import Lock from "../devices/Lock";
import calls from "./calls";

const config: Config = require("../../config.json");

interface Req {
  headers: IncomingHttpHeaders
}

const client: Client = new Client();
const activity: Activity = client.activity();

interface Server {
  address: string,
  port: number,
  ids: string[]
}

export default class APIv1Router {

  private _router: Router;
  private servers: Server[] = [];

  constructor() {
    this._router = Router();

    this.initDevices();
    this.initRoutes();
  }

  public onServer(address: string, port: number) {
    if(!this.servers.find(s => s.address == address)) {
      console.log("unknown server... adding " + address);
      const server: Server = {address, port, ids: []};
      this.servers.push(server);
      this.refreshServerInfo(server);
    }
  }

  private refreshServerInfo(server: Server) {
    this.safeDevices(server).then((devices:any[]) => {
      devices && (devices.length > 0) && devices.forEach(device => {
        if(device.id && !server.ids.find(i => i == device.id)) {
          server.ids.push(device.id);
        }
      })
    }).catch(() => {});
  }

  private safeDevices(server: Server): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const url = `http://${server.address}:${server.port}/v1/devices.json`;
      console.log(url);

      calls.get(url)
      .then(result => resolve(result))
      .catch(err => {
        console.log("master devices err", err);
        resolve([]);
      })
    });
  }

  private createFile(url: string, path: string) {
    console.log(`create file action on ${url} for path ${path}`);
    this._router.get(url, (req, res) => {
      const { code, id } = req.params;

      if(!Lock.instance.valid(id, code)) {
        res.status(400).json({error: "invalid session"});
        return;
      }

      const server: Server|undefined = this.findServer(id);
      if(!server) {
        res.status(404).json({error: "invalid server"});
        return;
      }
      var params = {code};
      var forged = url.replace(":id", id);
      const forwarded = `http://${server.address}:${server.port}` + forged;
      console.log("forwarding to " + url , params);

      calls.get(forwarded, params)
      .then(result => res.json(result))
      .catch(err => res.status(404).json({error: "catch"}));
    });
  }
  
  private createAction(url: string, action: string, options?: Option[]) {
    console.log(`create file action on ${url} for action ${action}`);
    this._router.get(url, (req, res) => {
      const { code, id } = req.params;
      

      if(!Lock.instance.valid(id, code)) {
        console.log("invalid session");
        res.status(400).json({error: "invalid session"});
        return;
      }

      const server: Server|undefined = this.findServer(id);
      if(!server) {
        console.log("invalid server");
        res.status(404).json({error: "invalid server"});
        return;
      }
      var params = {code};
      options && options.forEach(option => params[option.key] = req.params[option.key]);
      var forged = url.replace(":id", id);
      const forwarded = `http://${server.address}:${server.port}` + forged;
      console.log("forwarding to " + url , params);

      calls.get(forwarded, params)
      .then(result => res.json(result))
      .catch(err => {
        console.log("can't release", err);
        res.status(400).json({error: "can't release" })
      });
    });
  }

  private findServer(deviceId: string): Server|undefined {
    return this.servers.find(s => s.ids.find(id => deviceId == id));
  }

  private initDevices() {
    this._router.get("/devices.json", (req, res) => {

      Promise.all(this.servers.map(server => this.safeDevices(server)))
      .then((devices_from_server: any[][]) => {
        var array:any[] = [];
        if(devices_from_server && devices_from_server.length > 0) {
          devices_from_server.forEach((arr:any[]) => {
            if(arr && arr.length > 0) array = [...array, ...arr]
          });
        }
        res.json(array);
      })
      .catch(err => {
        console.log("error on devices", err);
        res.status(400).json({});
      })
    });

    this._router.post("/:id/lock.json", (req, res) => {
      var { id } = req.params;
      var { code } = req.body;

      if(!code || !id) {
        console.log("can't hold");
        res.status(400).json({error: "can't hold"});
        return;
      }

      const server: Server|undefined = this.findServer(id);
      if(!server) {
        console.log("invalid server");
        res.status(404).json({error: "invalid server"});
        return;
      }

      const url = `http://${server.address}:${server.port}/v1/${id}/lock.json`;
      console.log("forward to " + url, {code});
      calls.post(url, {code})
      .then(result => res.json(result))
      .catch(err => {
        console.log("can't release", err);
        res.status(400).json({error: "can't hold" })
      });
    });

    this._router.post("/:id/unlock.json", (req, res) => {
      var { id } = req.params;
      var { code } = req.body;
      if(!code || !id) {
        console.log("can't release");
        res.status(400).json({error: "can't release"});
        return;
      }

      const server: Server|undefined = this.findServer(id);
      if(!server) {
        console.log("invalid server");
        res.status(404).json({error: "invalid server"});
        return;
      }

      const url = `http://${server.address}:${server.port}/v1/${id}/unlock.json`;
      console.log("forward to " + url, {code});
      calls.post(url, {code})
      .then(result => res.json(result))
      .catch(err => {
        console.log("can't release", err);
        res.status(400).json({error: "can't release" })
      });
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
