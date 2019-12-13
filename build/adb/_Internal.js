"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class _Internal {
    constructor() {
    }
    id(id) {
        if (id.id) {
            return id.id;
        }
        return id;
    }
    delay(value, time) {
        return new Promise((resolve) => setTimeout(() => resolve(value), time));
    }
}
exports.default = _Internal;
//# sourceMappingURL=_Internal.js.map