export interface Device {
    id: string
    type: "device"|"emulator"
}

export default class _Internal {
    constructor() {

    }

    public id(id: string|Device): string {
        if((id as Device).id) {
            return (id as Device).id;
        }
        return id;
    }

    public delay<T>(value: T, time: number): Promise<T> {
        return new Promise((resolve) => setTimeout(() => resolve(value), time));
    }
}