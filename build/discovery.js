"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const dgram_1 = __importDefault(require("dgram"));
const os_1 = __importDefault(require("os"));
const broadcast_address_1 = __importDefault(require("broadcast-address"));
const config = require("../config.json");
const PORT_SLAVE = 1733;
const PORT_SERVER = 1732;
class DiscoveryService {
    constructor(mode) {
        this._bound = false;
        this.sockets = [];
        this.interfaces = new Map();
        this._masterLoop = () => {
            const object = os_1.default.networkInterfaces();
            if (object) {
                const keys = Object.keys(object);
                keys.forEach(key => {
                    if (!this.interfaces.has(key)) {
                        const socket = this.bindSearch(key);
                        this.interfaces.set(key, socket);
                    }
                });
            }
        };
        this._bound = false;
        this.mode = mode;
    }
    bind() {
        if (this._bound)
            return;
        this._bound = true;
        switch (this.mode) {
            case "slave":
                this.bindServer(PORT_SLAVE);
                break;
            case "master":
                this.initMaster();
            case null:
            case undefined:
            default:
                if (config.server.discovery) {
                    this.bindServer(PORT_SERVER);
                }
        }
    }
    initMaster() {
        this._masterLoop();
        setInterval(() => this._masterLoop(), 20000);
    }
    broadcastAddress(interf) {
        try {
            return broadcast_address_1.default(interf);
        }
        catch (e) {
            return null;
        }
    }
    bindSearch(interf) {
        const json = { discover: true };
        var message = new Buffer(JSON.stringify(json));
        var client = dgram_1.default.createSocket("udp4");
        client.on("message", (message, rinfo) => {
            try {
                const json = JSON.parse(message.toString());
                console.log("received..." + rinfo.address + " " + rinfo.port, json);
            }
            catch (e) {
                console.log("received invalid");
            }
        });
        client.bind(() => {
            console.log(`bind for ${interf}...`);
            client.setBroadcast(true);
            const callback = () => {
                try {
                    const broadcastAddr = this.broadcastAddress(interf);
                    if (!broadcastAddr)
                        return;
                    console.log(`sent ${broadcastAddr} on port ${PORT_SLAVE}...`);
                    client.send(message, 0, message.length, PORT_SLAVE, broadcastAddr);
                }
                catch (e) {
                    console.log("can't send on " + interf, e);
                }
            };
            callback();
            setInterval(callback, 20 * 1000);
        });
        return client;
    }
    bindServer(port) {
        const server = dgram_1.default.createSocket("udp4");
        server.on("listening", () => { });
        server.on("message", (message, rinfo) => {
            try {
                const json = JSON.parse(message);
                if (json.discover) {
                    const replay = { service: "massive_farm", data: { "port": config.server ? config.server.port : 0 } };
                    const message = new Buffer(JSON.stringify(replay));
                    console.log("send replay to " + rinfo.address + " " + rinfo.port);
                    server.send(message, 0, message.length, rinfo.port, rinfo.address);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
        server.bind(port);
        this.sockets.push(server);
    }
}
exports.default = DiscoveryService;
//# sourceMappingURL=discovery.js.map