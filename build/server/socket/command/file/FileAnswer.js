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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Lock_1 = __importDefault(require("../../../../devices/Lock"));
const AbstractCommand_1 = __importDefault(require("../AbstractCommand"));
class FileAnswer extends AbstractCommand_1.default {
    constructor(client, id, code, action, path) {
        super();
        this.client = client;
        this.id = id;
        this.code = code;
        this.action = action;
        this.path = path;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = yield this.client.listDevices();
            const { id, code, action, path } = this;
            if (!devices.find(d => d.id === id))
                throw "device not found";
            const lock = Lock_1.default.instance;
            console.log("action params ->> ", { code, id });
            const valid = lock.valid(id, code);
            if (!valid)
                throw "invalid session";
            const result = yield this.getFile(id, action, path);
            return { result };
        });
    }
    getFile(id, action, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activity = this.client.activity();
                yield activity.startActivity(id, action);
                const stream = yield this.client.pull(id, filePath);
                return new Promise((resolve, reject) => {
                    var reject_copy = reject;
                    var content = "";
                    stream.on("data", data => content += data);
                    stream.on("error", err => {
                        !!reject_copy && reject_copy(err);
                        reject_copy = undefined;
                    });
                    stream.on("end", () => {
                        if (!reject_copy)
                            return;
                        try {
                            resolve(JSON.parse(content));
                        }
                        catch (err) {
                            reject_copy(err);
                            reject_copy = undefined;
                        }
                    });
                });
            }
            catch (err) {
                console.log("obtained error for getFile", err);
                throw err;
            }
        });
    }
}
exports.default = FileAnswer;
//# sourceMappingURL=FileAnswer.js.map