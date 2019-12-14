"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adb_1 = require("../adb");
const config = require("../../config.json");
const client = new adb_1.Client();
const activity = client.activity();
class APIv1 {
    constructor() {
        this.router = () => this._router;
        this._router = express_1.Router();
        this.initDevices();
        this.initRoutes();
    }
    getFile(id, filePath) {
        return new Promise((resolve, reject) => {
            activity.startActivity(id)
                .then(done => client.pull(id, filePath))
                .then((stream) => {
                var content = "";
                stream.on("data", data => content += data);
                stream.on("end", () => {
                    try {
                        content = JSON.parse(content);
                    }
                    catch (e) {
                        content = "invalid";
                    }
                    resolve(content);
                });
            });
        });
    }
    createFile(url, path) {
        console.log(`create file action on ${url} for path ${path}`);
        this._router.get(url, (req, res) => {
            this.getFile(req.params.id, path)
                .then(content => {
                res.json(content);
            })
                .catch(err => {
                console.error(err);
                res.json({ error: "catch" });
            });
        });
    }
    createAction(url, action, options) {
        console.log(`create file action on ${url} for action ${action}`);
        this._router.get(url, (req, res) => {
            const opt = { action };
            options && options.forEach(option => {
                const def = option.def ? options[option.def] : null;
                opt[option.key] = req.params[option.key] || def;
            });
            activity.startActivity(req.params.id, opt)
                .then(result => res.json(result))
                .catch(err => {
                console.error(err);
                res.json({ error: "catch" });
            });
        });
    }
    initDevices() {
        this._router.get("/devices.json", (req, res) => {
            client.listDevices()
                .then(devices => {
                return Promise.all(devices.map(d => client.getProperties(d.id)))
                    .then(properties => {
                    var props = properties.map(p => {
                        return {
                            "brand": p["ro.product.brand"],
                            "manufacturer": p["ro.product.manufacturer"],
                            "model": p["ro.product.model"],
                        };
                    });
                    devices = devices.map((device, index) => {
                        return Object.assign({}, device, { infos: index < props.length ? props[index] : {} });
                    });
                    res.json(devices);
                });
            })
                .catch(err => {
                console.warn(err);
                res.json({});
            });
        });
    }
    initRoutes() {
        config.routes && config.routes.forEach(route => {
            if (route.path) {
                this.createFile(route.url, route.path);
            }
            else if (route.action) {
                this.createAction(route.url, route.action, route.options);
            }
            else {
                console.log("unknown action " + route.type);
            }
        });
    }
}
exports.default = APIv1;
//# sourceMappingURL=api_v1.js.map