"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _commands;
Object.defineProperty(exports, "__esModule", { value: true });
const uuidv4_1 = require("uuidv4");
const Loggable_1 = __importDefault(require("../Loggable"));
class Executor extends Loggable_1.default {
    constructor() {
        super(...arguments);
        _commands.set(this, new Map());
    }
    send(socket, params, timeout = 60000) {
        const pending = { uuid: uuidv4_1.uuid() };
        pending.promise = new Promise((resolve, reject) => {
            pending.resolve = resolve;
            pending.reject = reject;
            socket.emit("register", { uuid: pending.uuid, data: params });
        });
        setTimeout(() => {
            if (!pending.resolve || !pending.reject)
                return;
            this.log("Timeout for", { params, pending });
            pending.reject(Object.assign(new Error("Timeout call"), { params, pending }));
            this.remove(pending);
        }, timeout);
        __classPrivateFieldGet(this, _commands).set(pending.uuid, pending);
        return pending;
    }
    remove(pending) {
        this.log(`cleaning ${pending.uuid}`);
        pending.reject = undefined;
        pending.resolve = undefined;
        __classPrivateFieldGet(this, _commands).delete(pending.uuid);
    }
    tryUnlock(answer) {
        const { uuid } = answer;
        const pending = __classPrivateFieldGet(this, _commands).get(uuid);
        if (!(pending === null || pending === void 0 ? void 0 : pending.reject) || !(pending === null || pending === void 0 ? void 0 : pending.resolve))
            return;
        const error = answer;
        const ok = answer;
        if (error === null || error === void 0 ? void 0 : error.error) {
            this.log(`tryUnlock failed for ${pending.uuid}`, answer);
            pending.reject(Object.assign(new Error("Error call " + (error === null || error === void 0 ? void 0 : error.error)), { pending }));
        }
        else {
            this.log(`tryUnlock success for ${pending.uuid}`, answer);
            pending.resolve(ok === null || ok === void 0 ? void 0 : ok.result);
        }
        this.remove(pending);
    }
}
exports.default = Executor;
_commands = new WeakMap();
//# sourceMappingURL=Executor.js.map