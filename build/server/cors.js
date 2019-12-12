"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
class Cors {
    constructor() {
    }
    isOriginAccepted(origin) {
        return new Promise((resolve, reject) => {
            //if count @ > 1 >>> throw exception
            if (!origin)
                origin = "";
            origin = origin.split("@")[0];
            const array = ["http://localhost", "https://localhost"];
            resolve(!!array.find(a => origin.startsWith(a)));
        });
    }
    cors() {
        return cors_1.default({
            origin: (origin, callback) => {
                Cors.instance.isOriginAccepted(origin)
                    .then(accepted => callback(null, accepted))
                    .catch(err => callback(err));
            }
        });
    }
}
Cors.instance = new Cors();
exports.default = Cors;
//# sourceMappingURL=cors.js.map