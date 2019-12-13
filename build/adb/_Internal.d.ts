export interface Device {
    id: string;
    type: "device" | "emulator";
}
export default class _Internal {
    constructor();
    id(id: string | Device): string;
    delay<T>(value: T, time: number): Promise<T>;
}
