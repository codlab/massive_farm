import { Device } from "adbkit";

export default class _Internal {
  constructor() {

  }

  public id(id: string|Device): string {
    if((<Device> id).id) {
      return (<Device> id).id;
    } else {
      return <string> id;
    }
  }

  public delay<T>(value: T, time: number): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), time));
  }
}