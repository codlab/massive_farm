"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="adbkit.d.ts"/>
//@ts-ignore
const adbkit_1 = __importDefault(require("adbkit"));
const Activity_1 = __importDefault(require("./Activity"));
const _Internal_1 = __importDefault(require("./_Internal"));
class Client extends _Internal_1.default {
    constructor() {
        super();
        this._client = adbkit_1.default.createClient();
        this._activity = new Activity_1.default(this._client);
    }
    activity() {
        return this._activity;
    }
    listDevices() {
        return this._client.listDevices();
    }
    pull(id, filePath) {
        return this._client.pull(this.id(id), filePath);
    }
    stats(id, filePath) {
        return this._client.pull(this.id(id), filePath);
    }
    getProperties(id) {
        return this._client.getProperties(this.id(id));
    }
}
exports.default = Client;
//# sourceMappingURL=Client.js.map