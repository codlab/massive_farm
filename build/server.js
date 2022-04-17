"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const api_v1_1 = __importDefault(require("./server/api_v1"));
const discovery_1 = __importDefault(require("./discovery"));
const WebSocketClient_1 = __importDefault(require("./server/socket/WebSocketClient"));
const WebSocketServer_1 = __importDefault(require("./server/socket/WebSocketServer"));
const fs_1 = require("fs");
const config = require("../config.json");
;
class ApiServer {
    start() {
        var _a, _b, _c, _d, _e;
        if (this.app) {
            console.log("server already listening");
            return false;
        }
        const httpsConfiguration = (_a = config === null || config === void 0 ? void 0 : config.server) === null || _a === void 0 ? void 0 : _a.https;
        const socket = (_b = config === null || config === void 0 ? void 0 : config.server) === null || _b === void 0 ? void 0 : _b.socket;
        const master = socket;
        const client = socket;
        const port = (master === null || master === void 0 ? void 0 : master.port) || 9999;
        this.socketServer = new WebSocketServer_1.default(port);
        this.socketClient = new WebSocketClient_1.default((client === null || client === void 0 ? void 0 : client.url) || `http://127.0.0.1:${port}`);
        const mode = ((_c = config === null || config === void 0 ? void 0 : config.server) === null || _c === void 0 ? void 0 : _c.mode) || null;
        this.app = express_1.default();
        this.api_v1 = new api_v1_1.default(this.socketServer);
        this.app
            .use(express_1.default.static(path_1.default.join(__dirname, '../public')))
            .use(body_parser_1.default.json())
            .use("/v1", this.api_v1.router());
        //this.app.listen(config?.server?.port || 8080);
        if (httpsConfiguration && !!httpsConfiguration.use) {
            const credentials = {
                key: undefined,
                cert: undefined,
                ca: undefined
            };
            ["key", "cert", "ca"].forEach(key => {
                if (!!httpsConfiguration[key])
                    credentials[key] = fs_1.readFileSync(httpsConfiguration[key]);
            });
            this.server = https_1.default.createServer(credentials, this.app);
        }
        else {
            this.server = http_1.default.createServer(this.app);
        }
        const serverPort = ((_d = config === null || config === void 0 ? void 0 : config.server) === null || _d === void 0 ? void 0 : _d.port) || 8080;
        this.server.listen(serverPort, () => {
            console.log(`web server running at ${serverPort}`);
        });
        if (!!((_e = config === null || config === void 0 ? void 0 : config.server) === null || _e === void 0 ? void 0 : _e.discovery)) {
            this.discovery = new discovery_1.default(undefined, mode);
            this.discovery.bind();
        }
        return true;
    }
}
exports.default = ApiServer;
//# sourceMappingURL=server.js.map