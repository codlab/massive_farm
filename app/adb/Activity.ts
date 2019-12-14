import _Internal from "./_Internal";

export default class Activity extends _Internal {
  private _client: any;

  constructor(client: any) {
    super();
    this._client = client;
  }

  startActivity(id: string, optionals?: any): Promise<boolean> {
    return this._client.startActivity(id, {
      wait: true,
      action: "com.voxeet.intent.action.TEST_ACTION",
      extras: {
        status: true,
        ...optionals
      }
    });
  }

  shell = (id: string, command: string): Promise<Buffer> => this._client.shell(id, command);
}