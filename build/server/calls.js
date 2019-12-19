"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const precall = (url, method, qs, json) => {
    var options = {
        method: method,
        uri: url,
        headers: { "Content-Type": "application/json" },
    };
    if (json)
        options.json = json || true;
    if (qs)
        options.qs = qs || undefined;
    return new Promise((resolve, reject) => {
        request_1.default(options, (e, resp, body) => {
            console.log(body);
            try {
                if (typeof body == "string") {
                    body = JSON.parse(body);
                }
            }
            catch (e) {
                //error ?
                console.log(e);
            }
            if (body && !body.error && resp.code != 401)
                resolve(body);
            else
                reject({ error: body ? body.error : "invalid result" });
        });
    });
};
exports.default = {
    get: (url, params) => precall(url, "GET", params, undefined),
    post: (url, params) => precall(url, "POST", undefined, params)
};
//# sourceMappingURL=calls.js.map