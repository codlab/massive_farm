"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_v1_1 = __importDefault(require("./server/api_v1"));
class ApiServer {
    start() {
        if (this.app) {
            console.log("server already listening");
            return false;
        }
        this.app = express_1.default();
        this.app
            .use(cors_1.default())
            .use(body_parser_1.default.json())
            .use("/v1", api_v1_1.default);
        this.app.listen("8080");
        return true;
    }
}
exports.default = ApiServer;
//# sourceMappingURL=server.js.map