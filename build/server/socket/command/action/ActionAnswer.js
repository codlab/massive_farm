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
class ActionAnswer extends AbstractCommand_1.default {
    constructor(client, id, code, action, options) {
        super();
        this.client = client;
        this.id = id;
        this.code = code;
        this.action = action;
        this.options = options;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = yield this.client.listDevices();
            const activity = this.client.activity();
            const { id, code, action, options } = this;
            if (!devices.find(d => d.id === id))
                throw "device not found";
            const lock = Lock_1.default.instance;
            console.log("action params ->> ", { code, id });
            const valid = lock.valid(id, code);
            if (!valid)
                throw "invalid session";
            const intent_args = {};
            options.forEach(({ key, value }) => intent_args[key] = value);
            console.log("starting activity for ", { id, action, intent_args });
            const result = yield activity.startActivity(id, action, intent_args);
            console.log("result ?", result);
            return { result };
        });
    }
}
exports.default = ActionAnswer;
//# sourceMappingURL=ActionAnswer.js.map