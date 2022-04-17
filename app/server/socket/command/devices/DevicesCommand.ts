import AbstractCommand from "../AbstractCommand";

export interface DevicesInput {

}

export default class DevicesCommand extends AbstractCommand<DevicesInput> {
  public async create(): Promise<DevicesInput> {
    return {};
  }

}