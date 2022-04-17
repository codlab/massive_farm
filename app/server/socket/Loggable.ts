export default class Loggable {

  constructor() {

  }

  public log(text: string, value?: any) {
    const name = this.constructor.name;
    if (arguments.length > 1) {
      console.log(`${name} :: ${text}`, value);
    } else {
      console.log(`${name} :: ${text}`);
    }
  }

}