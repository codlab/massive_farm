"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adbkit_1 = __importDefault(require("adbkit"));
var client = adbkit_1.default.createClient();
const router = express_1.Router();
router.get("/:id/status.json", (req, res) => {
    client.startActivity(req.params.id, {
        wait: true,
        action: "com.voxeet.intent.action.TEST_ACTION",
        extras: {
            status: true
        }
    })
        .then(done => {
        res.json({ done });
    })
        .catch(err => {
        console.error(err);
        res.json({ error: "catch" });
    });
});
router.get("/devices.json", (req, res) => {
    client.listDevices()
        .then(devices => {
        return Promise.all(devices.map(d => client.getProperties(d.id)))
            .then((properties) => {
            properties = properties.map((p) => {
                return {
                    "brand": p["ro.product.brand"],
                    "manufacturer": p["ro.product.manufacturer"],
                    "model": p["ro.product.model"],
                };
            });
            devices = devices.map((device, index) => {
                return Object.assign({}, device, { infos: index < properties.length ? properties[index] : {} });
            });
            res.json({ devices });
        });
    })
        .catch(err => {
        console.warn(err);
        res.json({});
    });
});
exports.default = router;
//# sourceMappingURL=api_v1.js.map