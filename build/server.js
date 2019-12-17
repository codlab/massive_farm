"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_v1_1 = __importDefault(require("./server/api_v1"));
const discovery_1 = __importDefault(require("./discovery"));
class ApiServer {
    constructor() {
        this.api_v1 = new api_v1_1.default();
    }
    start() {
        if (this.app) {
            console.log("server already listening");
            return false;
        }
        this.app = express_1.default();
        this.discovery = new discovery_1.default();
        this.discovery.bind();
        this.app
            .use(body_parser_1.default.json())
            .use("/v1", this.api_v1.router());
        this.app.listen("8080");
        return true;
    }
}
exports.default = ApiServer;
//# sourceMappingURL=server.js.map