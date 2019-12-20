"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adb_1 = require("../adb");
const Lock_1 = __importDefault(require("../devices/Lock"));
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
            activity.startActivity(id, config.activity.action)
                .then(done => client.pull(id, filePath))
                .then((stream) => {
                var content = "";
                stream.on("data", data => content += data);
                stream.on("end", () => {
                    try {
                        resolve(JSON.parse(content));
                    }
                    catch (e) {
                        resolve({ error: "invalid" });
                    }
                });
            })
                .catch(err => reject(err));
        });
    }
    createFile(url, path) {
        console.log(`create file action on ${url} for path ${path}`);
        this._router.get(url, (req, res) => {
            const { code, id } = req.params;
            console.log(`file ->> ${{ code, id }}`);
            if (!Lock_1.default.instance.valid(id, code)) {
                res.status(400).json({ error: "invalid session" });
                return;
            }
            this.getFile(id, path)
                .then(content => {
                res.json(content);
            })
                .catch(err => {
                console.error(err);
                res.status(404).json({ error: "catch" });
            });
        });
    }
    createAction(url, action, options) {
        console.log(`create file action on ${url} for action ${action}`);
        this._router.get(url, (req, res) => {
            const { code, id } = req.params;
            console.log("action params ->>", { code, id });
            if (!Lock_1.default.instance.valid(id, code)) {
                res.status(400).json({ error: "invalid session" });
                return;
            }
            const opt = { action };
            options && options.forEach(option => {
                const def = option.def ? options[option.def] : null;
                opt[option.key] = req.params[option.key] || def;
            });
            activity.startActivity(id, config.activity.action, opt)
                .then(result => res.json(result))
                .catch(err => {
                console.error(err);
                res.status(400).json({ error: "catch" });
            });
        });
    }
    getProperties(deviceId) {
        return client.getProperties(deviceId)
            .catch(err => {
            console.error(`get properties for ${deviceId}`, err);
            return {};
        });
    }
    initDevices() {
        this._router.get("/devices.json", (req, res) => {
            client.listDevices()
                .then(devices => {
                return Promise.all(devices.map(d => this.getProperties(d.id)))
                    .then(properties => {
                    const lock = Lock_1.default.instance;
                    var props = properties.map(p => {
                        return {
                            "brand": p["ro.product.brand"],
                            "manufacturer": p["ro.product.manufacturer"],
                            "model": p["ro.product.model"],
                        };
                    });
                    devices = devices.map((device, index) => {
                        return Object.assign({}, device, { infos: index < props.length ? props[index] : {}, available: lock.available(device.id || "") });
                    });
                    res.json(devices);
                });
            })
                .catch(err => {
                console.warn(err);
                res.status(400).json({});
            });
        });
        this._router.post("/:id/lock.json", (req, res) => {
            var { id } = req.params;
            var { code } = req.body;
            if (!code || !id) {
                res.status(400).json({ error: "can't hold" });
                return;
            }
            Lock_1.default.instance.reserve(id || "", code || "")
                .then(result => res.json({ result }))
                .catch(err => res.status(400).json({ error: "can't hold" }));
        });
        this._router.post("/:id/unlock.json", (req, res) => {
            var { id } = req.params;
            var { code } = req.body;
            if (!code || !id) {
                res.status(400).json({ error: "can't release" });
                return;
            }
            Lock_1.default.instance.release(id || "", code || "")
                .then(result => res.json({ result }))
                .catch(err => res.status(400).json({ error: "can't release" }));
        });
    }
    initRoutes() {
        config.routes && config.routes.forEach(route => {
            if (route.path) {
                this.createFile(route.url, route.path);
            }
            else if (route.action) {
                const action = route;
                this.createAction(route.url, action.action, action.options);
            }
            else {
                console.log("unknown action ", route);
            }
        });
    }
}
exports.default = APIv1;
//# sourceMappingURL=api_v1.js.map