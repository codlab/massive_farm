import { Stream } from "stream";

declare module "adbkit" {
  export interface Device {
    id: string
    type: "device"|"emulator"
  }

  export interface Properties {
    "ro.product.brand": string,
    "ro.product.manufacturer": string,
    "ro.product.model": string,
  }

  export class AdbClient {
    listDevices(): Promise<Device[]>

    pull(id: string, filePath: string): Promise<Stream>

    getProperties(id: string): Promise<Properties>
  }

  export function createClient(): AdbClient;
}