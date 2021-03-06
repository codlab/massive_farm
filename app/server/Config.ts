export interface Activity {
  action: string
}

export interface RouteFile {
  url: string,
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
}

export type Route = RouteFile | RouteAction;

export interface Server {
  discovery: boolean,
  port: number,
  mode?: "master"|"slave"|"normal"
}

export default interface Config {
  server: Server,
  activity: Activity,
  routes: Route[]
}