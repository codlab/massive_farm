"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NUMBER_PACK_SECONDS_FOR_LOCKS = 10 * 60;
class Lock {
    constructor() {
        this.locks = new Map();
        setInterval(() => this.checkForClear(), 10000); //each 10s
    }
    checkForClear() {
        var list = [];
        this.locks.forEach((value, key) => {
            var countDown = value;
            if (countDown) {
                countDown.remaining -= 10;
                if (countDown.remaining <= 0) {
                    list.push(key);
                    console.log(`releasing ${key}`);
                }
            }
        });
        list.forEach(key => this.locks.delete(key));
    }
    available(id) {
        if (this.locks.has(id)) {
            var countDown = this.locks.get(id);
            return !countDown || countDown.remaining <= 0;
        }
        return true;
    }
    reserve(id, code) {
        var countDown = null;
        if (!this.locks.has(id)) {
            countDown = { code, remaining: NUMBER_PACK_SECONDS_FOR_LOCKS };
            this.locks.set(id, countDown);
            return Promise.resolve(true);
        }
        else {
            countDown = this.locks.get(id) || { code, remaining: 0 };
            //reset if matching codes
            if (countDown.code == code) {
                countDown.remaining = NUMBER_PACK_SECONDS_FOR_LOCKS;
                return Promise.resolve(true);
            }
        }
        return Promise.reject("can't hold on a reserved id");
    }
    release(id, code) {
        var countDown = null;
        if (this.locks.has(id)) {
            countDown = this.locks.get(id) || { code, remaining: 0 };
            //reset if matching codes
            if (countDown.code == code) {
                this.locks.delete(id);
                return Promise.resolve(true);
            }
        }
        return Promise.reject("can't release");
    }
}
Lock.instance = new Lock();
exports.default = Lock;
//# sourceMappingURL=Lock.js.map