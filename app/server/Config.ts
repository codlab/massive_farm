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


export default interface Config {
  activity: Activity,
  routes: Route[]
}