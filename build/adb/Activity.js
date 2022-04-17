"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Internal_1 = __importDefault(require("./_Internal"));
class Activity extends _Internal_1.default {
    constructor(client) {
        super();
        this.shell = (id, command) => this._client.shell(id, command);
        this._client = client;
    }
    startActivity(id, action, optionals) {
        return this._client.startActivity(id, {
            wait: true,
            action,
            extras: Object.assign({ status: true }, optionals)
        });
    }
}
exports.default = Activity;
//# sourceMappingURL=Activity.js.map