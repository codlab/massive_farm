import { Router } from "express";
import { IncomingHttpHeaders } from "http";
import { Client, Activity } from "../adb";
import { Stream } from "stream";
import Config, { RouteFile, RouteAction, Option } from "./Config";
import Lock from "../devices/Lock";

const config: Config = require("../../config.json");

interface Req {
  headers: IncomingHttpHeaders
}

const client: Client = new Client();
const activity: Activity = client.activity();

export default class APIv1 {

  private _router: Router;
  constructor() {
    this._router = Router();

    this.initDevices();
    this.initRoutes();
  }

  private getFile(id: string, filePath: string) {
    return new Promise((resolve, reject) => {
      activity.startActivity(id, config.activity.action)
      .then(done => client.pull(id, filePath))
      .then((stream: Stream) => {
        var content = "";
        stream.on("data", data => content += data);
        stream.on("end", () => {
          try {
            resolve(JSON.parse(content));
          } catch(e) {
            resolve({error:"invalid"});
          }
        })
      })
      .catch(err => reject(err));
    });
  }

  private createFile(url: string, path: string) {
    console.log(`create file action on ${url} for path ${path}`);
    this._router.get(url, (req, res) => {
      this.getFile(req.params.id, path)
      .then(content => {
        res.json(content);
      })
      .catch(err => {
        console.error(err);
        res.json({error: "catch"})
      });
    });
  }
  
  private createAction(url: string, action: string, options?: Option[]) {
    console.log(`create file action on ${url} for action ${action}`);
    this._router.get(url, (req, res) => {
      const opt = { action };
  
      options && options.forEach(option => {
        const def = option.def ? options[option.def] : null;
        opt[option.key] = req.params[option.key] || def;
      });
  
      activity.startActivity(req.params.id, config.activity.action, opt)
      .then(result => res.json(result))
      .catch(err => {
        console.error(err);
        res.json({error: "catch"})
      });
    });
  }

  private initDevices() {
    this._router.get("/devices.json", (req, res) => {
      client.listDevices()
      .then(devices => {
        return Promise.all(devices.map(d => client.getProperties(d.id)))
        .then(properties => {
          const lock: Lock = Lock.instance;
          var props:any = properties.map(p => {
            return {
              "brand": p["ro.product.brand"],
              "manufacturer": p["ro.product.manufacturer"],
              "model": p["ro.product.model"],
            }
          });

          devices = devices.map((device, index) => {
            return {
              ...device,
              infos: index < props.length ? props[index]: {},
              available: lock.available(device.id || "")
            }
          });
          res.json(devices);
        });
      })
      .catch(err => {
        console.warn(err);
        res.json({});
      })
    });

    this._router.post("/:id/lock.json", (req, res) => {
      var { id } = req.params;
      var { code } = req.body;
      if(!code || !id) {
        res.json({error: "can't hold"});
        return;
      }
      Lock.instance.reserve(id || "", code || "")
      .then(result => res.json({result}))
      .catch(err => res.json({error: "can't hold"}));
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
