import AbstractCommand from "../AbstractCommand";
export interface DevicesInput {
}
export default class DevicesCommand extends AbstractCommand<DevicesInput> {
    create(): Promise<DevicesInput>;
}
