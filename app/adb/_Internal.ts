//@ts-ignore
import { Device } from "adbkit";

export default class _Internal {
  constructor() {

  }

  public id(id: string|Device): string {
    if((id as Device).id) {
      return (id as Device).id;
    } else {
      return <string> id;
    }
  }

  public delay<T>(value: T, time: number): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), time));
  }
}