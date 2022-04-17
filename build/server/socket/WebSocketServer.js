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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _server, _sockets, _slaves, _executor, _routes, _activity;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = __importDefault(require("socket.io"));
const uuidv4_1 = require("uuidv4");
const DevicesCommand_1 = __importDefault(require("./command/devices/DevicesCommand"));
const LockCommand_1 = __importDefault(require("./command/lock/LockCommand"));
const UnlockCommand_1 = __importDefault(require("./command/unlock/UnlockCommand"));
const Executor_1 = __importDefault(require("./execute/Executor"));
const Loggable_1 = __importDefault(require("./Loggable"));
const ActionCommand_1 = __importDefault(require("./command/action/ActionCommand"));
const FileCommand_1 = __importDefault(require("./command/file/FileCommand"));
function id(socket) {
    return socket.customUuid;
}
class WebSocketServer extends Loggable_1.default {
    constructor(port) {
        super();
        this.port = port;
        _server.set(this, void 0);
        _sockets.set(this, new Map());
        _slaves.set(this, new Map());
        _executor.set(this, new Executor_1.default());
        // configuration
        _routes.set(this, []);
        _activity.set(this, { action: "" });
        __classPrivateFieldSet(this, _server, socket_io_1.default(port));
        __classPrivateFieldGet(this, _server).on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!!id(socket))
                    return;
                socket.on("command", (input) => this.onCommandReceivedForSocket(socket, input));
                socket.on("answer", (command) => {
                    this.log("having data ->", command);
                    try {
                        __classPrivateFieldGet(this, _executor).tryUnlock(command);
                    }
                    catch (err) {
                        this.log(`dropping call for data`, err);
                        socket.emit("answer", { uuid: uuidv4_1.uuid, data: { error: `command rejected for ${id(socket)}` } });
                    }
                });
                socket.customUuid = uuidv4_1.uuid();
                const _uuid = id(socket);
                !!_uuid && __classPrivateFieldGet(this, _sockets).set(_uuid, socket);
                this.log(`connection from socket ${id(socket)}`);
            }
            catch (err) {
                this.log(`failed to register a socket`, err);
            }
        }));
    }
    setConfiguration(activity, routes) {
        __classPrivateFieldSet(this, _activity, activity);
        __classPrivateFieldSet(this, _routes, routes);
    }
    onCommandReceivedForSocket(socket, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { command, uuid, data } = input;
            this.log("onCommandReceivedForSocket", input);
            try {
                const result = yield this.onCommandReceived(input, socket);
                const answer = this.answer(socket, { uuid, result });
            }
            catch (err) {
                this.log(`dropping call for register, socket is already known`, command);
                socket.emit("answer", { uuid, error: `command rejected for ${id(socket)}` });
            }
        });
    }
    onCommandReceived(input, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            const { command, uuid, data } = input;
            this.log("onCommandReceived", input);
            switch (command) {
                case "register": {
                    if (!socket)
                        throw "register but without socket";
                    this.log("having data", command);
                    const decoded = data;
                    if (!(decoded === null || decoded === void 0 ? void 0 : decoded.register) || !(decoded === null || decoded === void 0 ? void 0 : decoded.uuid))
                        throw "invalid register info";
                    const sock = __classPrivateFieldGet(this, _slaves).get(decoded.uuid);
                    if (sock) {
                        throw "dropping call for register, socket is already known";
                    }
                    __classPrivateFieldGet(this, _slaves).set(socket.customUuid, socket);
                    return {
                        message: `command valid for ${id(socket)}`,
                        activity: __classPrivateFieldGet(this, _activity),
                        routes: __classPrivateFieldGet(this, _routes)
                    };
                }
                case "devices": {
                    this.log("received command for devices");
                    return this.forwardDevices();
                }
                case "lock": {
                    this.log("received command for locking");
                    const input = data;
                    return this.forwardLock(input.id, input.code);
                }
                case "unlock": {
                    this.log("received command for unlocking");
                    const input = data;
                    return this.forwardUnlock(input.id, input.code);
                }
                case "lock_validity": {
                    this.log("received command for lock validity");
                    const input = data;
                    return this.forwardLockValidity(input.id, input.code);
                }
                case "action": {
                    this.log("received action command for device");
                    const input = data;
                    return this.forwardActionCommand(input.id, input.code, input.action, input.options);
                }
                case "file": {
                    this.log("received file command for device");
                    const input = data;
                    return this.forwardFileCommand(input.id, input.code, input.action, input.path);
                }
            }
            throw `${command} not managed`;
        });
    }
    answer(socket, answer) {
        return socket.emit("answer", answer);
    }
    forwardDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("forwardDevices");
            const sockets = [...__classPrivateFieldGet(this, _slaves).values()];
            const outputs = yield Promise.all(sockets.map(s => this.devices(s)));
            const output = { devices: [] };
            outputs.forEach(o => {
                o.devices.forEach(d => output.devices.push(d));
            });
            return output;
        });
    }
    forwardUnlock(id, code) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("forwardUnlock");
            const sockets = [...__classPrivateFieldGet(this, _slaves).values()];
            const outputs = yield Promise.all(sockets.map(s => this.unlock(s, id, code)));
            const valid = outputs.find(o => !!(o === null || o === void 0 ? void 0 : o.result));
            return valid || { result: false };
        });
    }
    unlock(socket, id, code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new UnlockCommand_1.default(id, code);
                const input = yield command.create();
                return yield __classPrivateFieldGet(this, _executor).send(socket, uuidv4_1.uuid(), "unlock", input);
            }
            catch (err) {
                this.log("error while unlocking device", err);
                return { result: false };
            }
        });
    }
    forwardLock(id, code) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("forwardLock");
            const sockets = [...__classPrivateFieldGet(this, _slaves).values()];
            const outputs = yield Promise.all(sockets.map(s => this.lock(s, id, code)));
            console.log("outputs ?", outputs);
            const valid = outputs.find(o => !!(o === null || o === void 0 ? void 0 : o.result));
            return valid || { result: false };
        });
    }
    lock(socket, id, code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new LockCommand_1.default(id, code);
                const input = yield command.create();
                return yield __classPrivateFieldGet(this, _executor).send(socket, uuidv4_1.uuid(), "lock", input);
            }
            catch (err) {
                this.log("error while locking device", err);
                return { result: false };
            }
        });
    }
    forwardLockValidity(id, code) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("forwardLockValidity");
            const sockets = [...__classPrivateFieldGet(this, _slaves).values()];
            const outputs = yield Promise.all(sockets.map(s => this.lockValidity(s, id, code)));
            const valid = outputs.find(o => !!(o === null || o === void 0 ? void 0 : o.result));
            return valid || { result: false };
        });
    }
    lockValidity(socket, id, code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new LockCommand_1.default(id, code);
                const input = yield command.create();
                return yield __classPrivateFieldGet(this, _executor).send(socket, uuidv4_1.uuid(), "lock_validity", input);
            }
            catch (err) {
                this.log("error while checking lock validity for device", err);
                return { result: false };
            }
        });
    }
    forwardActionCommand(id, code, action, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("forwardActionCommand");
            const sockets = [...__classPrivateFieldGet(this, _slaves).values()];
            const outputs = yield Promise.all(sockets.map(s => this.action(s, id, code, action, options)));
            const valid = outputs.find(o => !!(o === null || o === void 0 ? void 0 : o.result));
            return valid || { result: false };
        });
    }
    action(socket, id, code, action, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new ActionCommand_1.default(id, code, action, options);
                const input = yield command.create();
                return yield __classPrivateFieldGet(this, _executor).send(socket, uuidv4_1.uuid(), "action", input);
            }
            catch (err) {
                this.log("error while unlocking device", err);
                return { result: false };
            }
        });
    }
    forwardFileCommand(id, code, action, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log("forwardFileCommand");
            const sockets = [...__classPrivateFieldGet(this, _slaves).values()];
            const outputs = yield Promise.all(sockets.map(s => this.file(s, id, code, action, path)));
            const valid = outputs.find(o => !!(o === null || o === void 0 ? void 0 : o.result));
            return valid || { result: false };
        });
    }
    file(socket, id, code, action, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new FileCommand_1.default(id, code, action, path);
                const input = yield command.create();
                return yield __classPrivateFieldGet(this, _executor).send(socket, uuidv4_1.uuid(), "file", input);
            }
            catch (err) {
                this.log("error while pulling file from device", err);
                return { result: false };
            }
        });
    }
    devices(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new DevicesCommand_1.default();
                const input = yield command.create();
                return yield __classPrivateFieldGet(this, _executor).send(socket, uuidv4_1.uuid(), "devices", input);
            }
            catch (err) {
                this.log("error while looking for device", err);
                return { devices: [] };
            }
        });
    }
}
exports.default = WebSocketServer;
_server = new WeakMap(), _sockets = new WeakMap(), _slaves = new WeakMap(), _executor = new WeakMap(), _routes = new WeakMap(), _activity = new WeakMap();
//# sourceMappingURL=WebSocketServer.js.map