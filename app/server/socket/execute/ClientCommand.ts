export type ClientCommand<COMMAND> = {
  uuid: string,
  command: string,
  data: COMMAND,
}