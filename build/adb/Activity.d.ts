import _Internal from "./_Internal";
export default class Activity extends _Internal {
    private _client;
    constructor(client: any);
    startActivity(id: string, optionals?: any): Promise<boolean>;
    shell: (id: string, command: string) => Promise<Buffer>;
}
