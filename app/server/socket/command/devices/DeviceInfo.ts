//@ts-ignore
import { Device, Properties } from "adbkit";

export interface DeviceInfo extends Device {
  id: string,
  infos: Properties[],
  available: boolean
}