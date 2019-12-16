const NUMBER_PACK_SECONDS_FOR_LOCKS = 10 * 60;
interface CountDown {
  code: string,
  remaining: number
}

export default class Lock {

  private locks: Map<string, CountDown> = new Map();

  public static instance: Lock = new Lock();
  private constructor() {
    setInterval(() => this.checkForClear(), 10000); //each 10s
  }

  private checkForClear() {
    var list: string[] = [];
    this.locks.forEach((value, key) => {
      var countDown: CountDown|undefined = value;
      if(countDown) {
        countDown.remaining -= 10;
        if(countDown.remaining <= 0) {
          list.push(key);
          console.log(`releasing ${key}`);
        }
      }
    });

    list.forEach(key => this.locks.delete(key));
  }

  valid(id: string, code: string): boolean {
    if(this.locks.has(id)) {
      var countDown: CountDown|undefined = this.locks.get(id);
      return !!countDown && (countDown.code == code) && (countDown.remaining > 0);
    }
    return false;
  }

  available(id: string): boolean {
    if(this.locks.has(id)) {
      var countDown: CountDown|undefined = this.locks.get(id);
      return !countDown || countDown.remaining <= 0;
    }
    return true;
  }

  reserve(id: string, code: string): Promise<boolean> {
    var countDown: CountDown|null = null;

    if(!this.locks.has(id)) {
      countDown = {code, remaining: NUMBER_PACK_SECONDS_FOR_LOCKS};
      this.locks.set(id, countDown);
      return Promise.resolve(true);
    } else {
      countDown = this.locks.get(id) || {code, remaining: 0};
      //reset if matching codes
      if(countDown.code == code) {
        countDown.remaining = NUMBER_PACK_SECONDS_FOR_LOCKS;
        return Promise.resolve(true);
      }
    }

    return Promise.reject("can't hold on a reserved id");
  }

  release(id: string, code: string): Promise<boolean> {
    var countDown: CountDown|null = null;

    if(this.locks.has(id)) {
      countDown = this.locks.get(id) || {code, remaining: 0};
      //reset if matching codes
      if(countDown.code == code) {
        this.locks.delete(id);
        return Promise.resolve(true);
      }
    }

    return Promise.reject("can't release");
  }
}