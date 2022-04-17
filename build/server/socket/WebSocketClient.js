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
var _socket, _id, _executor, _client;
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const uuidv4_1 = require("uuidv4");
const Executor_1 = __importDefault(require("./execute/Executor"));
const Loggable_1 = __importDefault(require("./Loggable"));
const DevicesAnswer_1 = __importDefault(require("./command/devices/DevicesAnswer"));
const adb_1 = require("../../adb");
const LockAnswer_1 = __importDefault(require("./command/lock/LockAnswer"));
const UnlockAnswer_1 = __importDefault(require("./command/unlock/UnlockAnswer"));
const LockValidityAnswer_1 = __importDefault(require("./command/lock_validity/LockValidityAnswer"));
const ActionAnswer_1 = __importDefault(require("./command/action/ActionAnswer"));
const FileAnswer_1 = __importDefault(require("./command/file/FileAnswer"));
class WebSocketClient extends Loggable_1.default {
    constructor(master) {
        super();
        this.master = master;
        _socket.set(this, void 0);
        _id.set(this, uuidv4_1.uuid());
        _executor.set(this, new Executor_1.default());
        _client.set(this, new adb_1.Client());
        __classPrivateFieldSet(this, _socket, socket_io_client_1.default(master));
        __classPrivateFieldGet(this, _socket).on("connect", () => this.onConnect());
        __classPrivateFieldGet(this, _socket).on("answer", (data) => {
            this.log(`receiving data -> `, data);
            __classPrivateFieldGet(this, _executor).tryUnlock(data);
        });
        __classPrivateFieldGet(this, _socket).on("command", (input) => this.onCommandReceived(input));
    }
    onCommandReceived(input) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log(`receiving command`, input);
            const { uuid, command, data } = input;
            try {
                switch (command) {
                    case "devices":
                        {
                            const command = new DevicesAnswer_1.default(__classPrivateFieldGet(this, _client));
                            const devices = yield command.create();
                            __classPrivateFieldGet(this, _executor).reply(__classPrivateFieldGet(this, _socket), uuid, devices);
                        }
                        ;
                        break;
                    case "lock":
                        {
                            this.log("received command for locking");
                            const input = data;
                            const command = new LockAnswer_1.default(__classPrivateFieldGet(this, _client), input === null || input === void 0 ? void 0 : input.id, input === null || input === void 0 ? void 0 : input.code);
                            const result = yield command.create();
                            __classPrivateFieldGet(this, _executor).reply(__classPrivateFieldGet(this, _socket), uuid, result);
                        }
                        ;
                        break;
                    case "unlock":
                        {
                            this.log("received command for unlocking");
                            const input = data;
                            const command = new UnlockAnswer_1.default(input === null || input === void 0 ? void 0 : input.id, input === null || input === void 0 ? void 0 : input.code);
                            const result = yield command.create();
                            __classPrivateFieldGet(this, _executor).reply(__classPrivateFieldGet(this, _socket), uuid, result);
                        }
                        ;
                        break;
                    case "lock_validity":
                        {
                            this.log("received command for checking lock validity");
                            const input = data;
                            const command = new LockValidityAnswer_1.default(__classPrivateFieldGet(this, _client), input === null || input === void 0 ? void 0 : input.id, input === null || input === void 0 ? void 0 : input.code);
                            const result = yield command.create();
                            __classPrivateFieldGet(this, _executor).reply(__classPrivateFieldGet(this, _socket), uuid, result);
                        }
                        ;
                        break;
                    case "action":
                        {
                            this.log("received command for action on device");
                            const input = data;
                            const command = new ActionAnswer_1.default(__classPrivateFieldGet(this, _client), input === null || input === void 0 ? void 0 : input.id, input === null || input === void 0 ? void 0 : input.code, input === null || input === void 0 ? void 0 : input.action, (input === null || input === void 0 ? void 0 : input.options) || []);
                            const result = yield command.create();
                            this.log("action result : ", result);
                            __classPrivateFieldGet(this, _executor).reply(__classPrivateFieldGet(this, _socket), uuid, result);
                        }
                        ;
                        break;
                    case "file":
                        {
                            this.log("received command for file pulling on device");
                            const input = data;
                            const command = new FileAnswer_1.default(__classPrivateFieldGet(this, _client), input === null || input === void 0 ? void 0 : input.id, input === null || input === void 0 ? void 0 : input.code, input === null || input === void 0 ? void 0 : input.action, input === null || input === void 0 ? void 0 : input.path);
                            const result = yield command.create();
                            this.log("file result : ", result);
                            __classPrivateFieldGet(this, _executor).reply(__classPrivateFieldGet(this, _socket), uuid, result);
                        }
                        ;
                        break;
                    default: throw `unknown command ${command}`;
                }
            }
            catch (err) {
                this.log("onCommandreceived error", err);
                __classPrivateFieldGet(this, _executor).error(__classPrivateFieldGet(this, _socket), uuid, `${err}`);
            }
        });
    }
    onConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield __classPrivateFieldGet(this, _executor).send(__classPrivateFieldGet(this, _socket), uuidv4_1.uuid(), "register", { register: true, uuid: __classPrivateFieldGet(this, _id) });
                this.log(`connection to ${this.master} result`, result);
            }
            catch (err) {
                this.log(`failed connect register to ${this.master}`, err);
            }
        });
    }
}
exports.default = WebSocketClient;
_socket = new WeakMap(), _id = new WeakMap(), _executor = new WeakMap(), _client = new WeakMap();
//# sourceMappingURL=WebSocketClient.js.map