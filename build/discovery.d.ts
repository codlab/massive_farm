export declare type Mode = "normal" | "slave" | "master" | null | undefined;
export interface OnServerFound {
    (address: string, port: number): void;
}
export default class DiscoveryService {
    _bound: boolean;
    private sockets;
    private mode;
    private listener?;
    private interfaces;
    constructor(listener?: OnServerFound, mode?: Mode);
    bind(): void;
    private _masterLoop;
    private initMaster;
    private broadcastAddress;
    private bindSearch;
    private bindServer;
}
