//@ts-ignore
import { Device, Properties } from "adbkit";

export interface DeviceInfo extends Device {
  infos: Properties[],
  available: boolean
}