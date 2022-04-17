export interface Activity {
    action: string;
}
export interface RouteFile {
    url: string;
    action: string;
    path: string;
}
export interface Option {
    key: string;
    def?: string;
}
export interface RouteAction {
    url: string;
    action: string;
    options?: Option[];
}
export declare type Route = RouteFile | RouteAction;
export declare type SocketSlave = {
    url?: string;
};
export declare type SocketMaster = {
    port?: number;
};
export declare type SocketConfig = SocketSlave | SocketMaster | undefined;
export interface Server {
    discovery: boolean;
    port: number;
    mode?: "master" | "slave" | "normal";
    socket?: SocketConfig;
    https?: {
        use?: boolean;
        key?: string;
        cert?: string;
        ca?: string;
    };
}
export default interface Config {
    server: Server;
    activity: Activity;
    routes: Route[];
}
