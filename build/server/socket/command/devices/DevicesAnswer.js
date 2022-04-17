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
class DevicesAnswer extends AbstractCommand_1.default {
    constructor(client) {
        super();
        this.client = client;
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = yield this.client.listDevices();
            const properties = yield Promise.all(devices.map(d => this.getProperties(d.id)));
            const lock = Lock_1.default.instance;
            var props = properties.map(p => {
                return {
                    "brand": p["ro.product.brand"],
                    "manufacturer": p["ro.product.manufacturer"],
                    "model": p["ro.product.model"],
                };
            });
            return {
                devices: devices.map((device, index) => (Object.assign(Object.assign({}, device), { infos: index < props.length ? props[index] : {}, available: lock.available(device.id || "") })))
            };
        });
    }
    getProperties(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.getProperties(deviceId);
            }
            catch (err) {
                console.error(`get properties for ${deviceId}`, err);
                return {};
            }
        });
    }
}
exports.default = DevicesAnswer;
//# sourceMappingURL=DevicesAnswer.js.map