"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const dgram_1 = __importDefault(require("dgram"));
const config = require("../config.json");
var server = dgram_1.default.createSocket("udp4");
server.on("message", function (message, rinfo) {
    try {
        const json = JSON.parse(message);
        if (json.discover) {
            const replay = {
                service: "massive_farm",
                data: {
                    "port": config.server ? config.server.port : 0
                }
            };
            const message = new Buffer(JSON.stringify(replay));
            console.log("send replay to " + rinfo.address + " " + rinfo.port);
            server.send(message, 0, message.length, rinfo.port, rinfo.address);
        }
    }
    catch (e) {
        console.log(e);
    }
});
server.on("listening", function () {
    var address = server.address();
    console.log("server listening " + address.address + ":" + address.port);
});
class DiscoveryService {
    constructor() {
        this._bound = false;
        this._bound = false;
    }
    bind() {
        if (!this._bound && config.server.discovery) {
            this._bound = true;
            server.bind(1732);
        }
        else {
            console.log("can't bind");
        }
    }
}
exports.default = DiscoveryService;
//# sourceMappingURL=discovery.js.map