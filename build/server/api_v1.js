"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adb_1 = require("../adb");
const router = express_1.Router();
const client = new adb_1.Client();
const activity = client.activity();
router.get("/:id/create/:conferenceAlias.json", (req, res) => {
    activity.startActivity(req.params.id, {
        action: "create",
        codec: req.params.codec || "h264",
        conferenceAlias: req.params.conferenceAlias || null
    })
        .then(result => res.json({ result }))
        .catch(err => {
        console.error(err);
        res.json({ error: "catch" });
    });
});
router.get("/:id/join/:conference.json", (req, res) => {
    activity.startActivity(req.params.id, {
        action: "join",
        conferenceId: req.params.conferenceId || ""
    })
        .then(result => res.json({ result }))
        .catch(err => {
        console.error(err);
        res.json({ error: "catch" });
    });
});
function actionNoParameter(action) {
    return (req, res) => {
        activity.startActivity(req.params.id, { action })
            .then(result => res.json({ result }))
            .catch(err => {
            console.error(err);
            res.json({ error: "catch" });
        });
    };
}
router.get("/:id/startVideo.json", actionNoParameter("startVideo"));
router.get("/:id/stopVideo.json", actionNoParameter("stopVideo"));
function getFile(id, filePath) {
    return new Promise((resolve, reject) => {
        activity.startActivity(id)
            .then(done => client.pull(id, filePath))
            .then((stream) => {
            var content = "";
            stream.on("data", data => content += data);
            stream.on("end", () => {
                try {
                    content = JSON.parse(content);
                }
                catch (e) {
                    content = "invalid";
                }
                resolve(content);
            });
        });
    });
}
router.get("/:id/status.json", (req, res) => {
    getFile(req.params.id, "/storage/emulated/0/Android/data/com.voxeet.sample/cache/status.json")
        .then(content => {
        res.json({ content });
    })
        .catch(err => {
        console.error(err);
        res.json({ error: "catch" });
    });
});
router.get("/:id/webrtc.json", (req, res) => {
    getFile(req.params.id, "/storage/emulated/0/Android/data/com.voxeet.sample/cache/webrtc.json")
        .then(content => {
        res.json({ content });
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
            var props = properties.map((p) => {
                return {
                    "brand": p["ro.product.brand"],
                    "manufacturer": p["ro.product.manufacturer"],
                    "model": p["ro.product.model"],
                };
            });
            devices = devices.map((device, index) => {
                return Object.assign({}, device, { infos: index < props.length ? props[index] : {} });
            });
            res.json(devices);
        });
    })
        .catch(err => {
        console.warn(err);
        res.json({});
    });
});
exports.default = router;
//# sourceMappingURL=api_v1.js.map