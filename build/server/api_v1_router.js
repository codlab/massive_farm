"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adb_1 = require("../adb");
const Lock_1 = __importDefault(require("../devices/Lock"));
const calls_1 = __importDefault(require("./calls"));
const config = require("../../config.json");
const client = new adb_1.Client();
const activity = client.activity();
class APIv1Router {
    constructor() {
        this.servers = [];
        this.router = () => this._router;
        this._router = express_1.Router();
        this.initDevices();
        this.initRoutes();
    }
    onServer(address, port) {
        if (!this.servers.find(s => s.address == address)) {
            console.log("unknown server... adding " + address);
            const server = { address, port, ids: [] };
            this.servers.push(server);
            this.refreshServerInfo(server);
        }
    }
    refreshServerInfo(server) {
        this.safeDevices(server).then((devices) => {
            devices && (devices.length > 0) && devices.forEach(device => {
                if (device.id && !server.ids.find(i => i == device.id)) {
                    server.ids.push(device.id);
                }
            });
        }).catch(() => { });
    }
    safeDevices(server) {
        return new Promise((resolve, reject) => {
            const url = `http://${server.address}:${server.port}/v1/devices.json`;
            console.log(url);
            calls_1.default.get(url)
                .then(result => resolve(result))
                .catch(err => {
                console.log("master devices err", err);
                resolve([]);
            });
        });
    }
    createFile(url, path) {
        console.log(`create file action on ${url} for path ${path}`);
        this._router.get(url, (req, res) => {
            const { code, id } = req.params;
            if (!Lock_1.default.instance.valid(id, code)) {
                res.status(400).json({ error: "invalid session" });
                return;
            }
            const server = this.findServer(id);
            if (!server) {
                res.status(404).json({ error: "invalid server" });
                return;
            }
            var params = { code };
            var forged = url.replace(":id", id);
            const forwarded = `http://${server.address}:${server.port}` + forged;
            console.log("forwarding to " + url, params);
            calls_1.default.get(forwarded, params)
                .then(result => res.json(result))
                .catch(err => res.status(404).json({ error: "catch" }));
        });
    }
    createAction(url, action, options) {
        console.log(`create file action on ${url} for action ${action}`);
        this._router.get(url, (req, res) => {
            const { code, id } = req.params;
            if (!Lock_1.default.instance.valid(id, code)) {
                console.log("invalid session");
                res.status(400).json({ error: "invalid session" });
                return;
            }
            const server = this.findServer(id);
            if (!server) {
                console.log("invalid server");
                res.status(404).json({ error: "invalid server" });
                return;
            }
            var params = { code };
            options && options.forEach(option => params[option.key] = req.params[option.key]);
            var forged = url.replace(":id", id);
            const forwarded = `http://${server.address}:${server.port}` + forged;
            console.log("forwarding to " + url, params);
            calls_1.default.get(forwarded, params)
                .then(result => res.json(result))
                .catch(err => {
                console.log("can't release", err);
                res.status(400).json({ error: "can't release" });
            });
        });
    }
    findServer(deviceId) {
        return this.servers.find(s => s.ids.find(id => deviceId == id));
    }
    initDevices() {
        this._router.get("/devices.json", (req, res) => {
            Promise.all(this.servers.map(server => this.safeDevices(server)))
                .then((devices_from_server) => {
                var array = [];
                if (devices_from_server && devices_from_server.length > 0) {
                    devices_from_server.forEach((arr) => {
                        if (arr && arr.length > 0)
                            array = [...array, ...arr];
                    });
                }
                res.json(array);
            })
                .catch(err => {
                console.log("error on devices", err);
                res.status(400).json({});
            });
        });
        this._router.post("/:id/lock.json", (req, res) => {
            var { id } = req.params;
            var { code } = req.body;
            if (!code || !id) {
                console.log("can't hold");
                res.status(400).json({ error: "can't hold" });
                return;
            }
            const server = this.findServer(id);
            if (!server) {
                console.log("invalid server");
                res.status(404).json({ error: "invalid server" });
                return;
            }
            const url = `http://${server.address}:${server.port}/v1/${id}/lock.json`;
            console.log("forward to " + url, { code });
            calls_1.default.post(url, { code })
                .then(result => res.json(result))
                .catch(err => {
                console.log("can't release", err);
                res.status(400).json({ error: "can't hold" });
            });
        });
        this._router.post("/:id/unlock.json", (req, res) => {
            var { id } = req.params;
            var { code } = req.body;
            if (!code || !id) {
                console.log("can't release");
                res.status(400).json({ error: "can't release" });
                return;
            }
            const server = this.findServer(id);
            if (!server) {
                console.log("invalid server");
                res.status(404).json({ error: "invalid server" });
                return;
            }
            const url = `http://${server.address}:${server.port}/v1/${id}/unlock.json`;
            console.log("forward to " + url, { code });
            calls_1.default.post(url, { code })
                .then(result => res.json(result))
                .catch(err => {
                console.log("can't release", err);
                res.status(400).json({ error: "can't release" });
            });
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
exports.default = APIv1Router;
//# sourceMappingURL=api_v1_router.js.map