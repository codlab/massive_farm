export interface Activity {
  action: string
}

export interface RouteFile {
  url: string,
  action: string,
  path: string
}

export interface Option {
  key: string,
  def?: string
}

export interface RouteAction {
  url: string,
  action: string,
  options?: Option[]
};

export type Route = RouteFile | RouteAction;

export type SocketSlave = {
  url?: string,
};

export type SocketMaster = { 
  port?: number
};

export type SocketConfig = SocketSlave | SocketMaster | undefined;

export interface Server {
  discovery: boolean,
  port: number,
  mode?: "master"|"slave"|"normal",
  socket?: SocketConfig
}

export default interface Config {
  server: Server,
  activity: Activity,
  routes: Route[]
}