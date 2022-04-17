"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adb_1 = require("../adb");
const config = require("../../config.json");
const client = new adb_1.Client();
const activity = client.activity();
class APIv1 {
    constructor(commandScheduler) {
        this.commandScheduler = commandScheduler;
        this.router = () => this._router;
        commandScheduler.setConfiguration(config.activity, config.routes);
        this._router = express_1.Router();
        this.initDevices();
        this.initRoutes();
    }
    createFile(url, path) {
        console.log(`create file action on ${url} for path ${path}`);
        this._router.get(url, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { code } = req.query;
                if (typeof code !== "string")
                    throw "invalid code type";
                console.log("file ->> ", { code, id });
                const valid = yield this.commandScheduler.forwardLockValidity(id, code);
                if (!(valid === null || valid === void 0 ? void 0 : valid.result))
                    throw "invalid session";
                const result = yield this.commandScheduler.forwardFileCommand(id, code, config.activity.action, path);
                return res.json(result);
            }
            catch (err) {
                console.error(err);
                return res.status(404).json({ error: `${err}` });
            }
        }));
    }
    createAction(url, action, options) {
        console.log(`create intent action on ${url} for action ${action}`);
        this._router.get(url, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { code } = req.query;
                if (typeof code !== "string")
                    throw "invalid code type";
                console.log("action params ->> ", { code, id });
                const valid = yield this.commandScheduler.forwardLockValidity(id, code);
                if (!(valid === null || valid === void 0 ? void 0 : valid.result))
                    throw "invalid session";
                const keyValues = (options === null || options === void 0 ? void 0 : options.map(({ key, def }) => {
                    const value = req.query[key] || def;
                    if (typeof value !== "string")
                        return { key, value: null };
                    return { key, value };
                })) || [];
                console.log("starting activity for ", { id, code, action: config.activity.action, keyValues });
                const result = yield this.commandScheduler.forwardActionCommand(id, code, config.activity.action, keyValues);
                return res.json(result);
            }
            catch (err) {
                console.error(err);
                return res.status(400).json({ error: `${err}` });
            }
        }));
    }
    initDevices() {
        this._router.get("/devices.json", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const output = yield this.commandScheduler.forwardDevices();
                return res.json(output.devices);
            }
            catch (err) {
                console.warn(err);
                return res.status(400).json({});
            }
        }));
        this._router.all("/:id/lock.json", (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                var { id } = req.params;
                var code = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.code;
                if (!code)
                    code = (_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.code;
                if (!code || !id)
                    throw "can't hold";
                const result = yield this.commandScheduler.forwardLock(id, code);
                return res.json(result);
            }
            catch (err) {
                return res.status(400).json({ error: `${err}` });
            }
        }));
        this._router.all("/:id/unlock.json", (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            try {
                var { id } = req.params;
                var code = (_c = req === null || req === void 0 ? void 0 : req.body) === null || _c === void 0 ? void 0 : _c.code;
                if (!code)
                    code = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.code;
                if (!code || !id)
                    throw "can't release";
                const result = yield this.commandScheduler.forwardUnlock(id, code);
                return res.json(result);
            }
            catch (err) {
                return res.status(400).json({ error: `${err}` });
            }
        }));
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