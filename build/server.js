"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_v1_1 = __importDefault(require("./server/api_v1"));
const discovery_1 = __importDefault(require("./discovery"));
const WebSocketClient_1 = __importDefault(require("./server/socket/WebSocketClient"));
const WebSocketServer_1 = __importDefault(require("./server/socket/WebSocketServer"));
const config = require("../config.json");
;
class ApiServer {
    start() {
        var _a, _b;
        if (this.app) {
            console.log("server already listening");
            return false;
        }
        const socket = (_a = config === null || config === void 0 ? void 0 : config.server) === null || _a === void 0 ? void 0 : _a.socket;
        const master = socket;
        const client = socket;
        const port = (master === null || master === void 0 ? void 0 : master.port) || 9999;
        this.socketServer = new WebSocketServer_1.default(port);
        this.socketClient = new WebSocketClient_1.default((client === null || client === void 0 ? void 0 : client.url) || `http://127.0.0.1:${port}`);
        const mode = ((_b = config === null || config === void 0 ? void 0 : config.server) === null || _b === void 0 ? void 0 : _b.mode) || null;
        this.app = express_1.default();
        /*if("master" == mode) {
          const api: APIv1Router = new APIv1Router();
          this.api_v1 = api;
          var callback: OnServerFound|null = (address, port) => {
            api.onServer(address, port);
          };
          this.discovery = new DiscoveryService(callback, mode);
        } else */
        {
            this.api_v1 = new api_v1_1.default(this.socketServer);
            this.discovery = new discovery_1.default(undefined, mode);
        }
        this.app
            .use(body_parser_1.default.json())
            .use("/v1", this.api_v1.router());
        this.app.listen("8080");
        this.discovery.bind();
        return true;
    }
}
exports.default = ApiServer;
//# sourceMappingURL=server.js.map