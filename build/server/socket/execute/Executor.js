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
const Loggable_1 = __importDefault(require("../Loggable"));
class Executor extends Loggable_1.default {
    constructor() {
        super(...arguments);
        _commands.set(this, new Map());
    }
    reply(socket, uuid, result) {
        socket.emit("answer", { uuid, result });
    }
    error(socket, uuid, error) {
        socket.emit("answer", { uuid, error });
    }
    send(socket, uuid, command, params, timeout = 60000) {
        const pending = { uuid, command };
        pending.promise = new Promise((resolve, reject) => {
            this.log("promise created for socket", params);
            pending.resolve = resolve;
            pending.reject = reject;
            socket.emit("command", { uuid, command, data: params });
        });
        setTimeout(() => {
            if (!pending.resolve || !pending.reject)
                return;
            this.log("Timeout for", { params, pending });
            pending.reject(Object.assign(new Error("Timeout call"), { params, pending }));
            this.remove(pending);
        }, timeout);
        __classPrivateFieldGet(this, _commands).set(pending.uuid, pending);
        return pending.promise;
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