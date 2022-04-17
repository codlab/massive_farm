"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Loggable {
    constructor() {
    }
    log(text, value) {
        const name = this.constructor.name;
        if (arguments.length > 1) {
            console.log(`${name} :: ${text}`, value);
        }
        else {
            console.log(`${name} :: ${text}`);
        }
    }
}
exports.default = Loggable;
//# sourceMappingURL=Loggable.js.map