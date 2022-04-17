import { Client } from "../../../../adb";
import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";

export interface FileOutput {
  result: boolean;
}

export default class FileAnswer extends AbstractCommand<FileOutput> {
  public constructor(private client: Client, 
    private id: string, private code: string,
    private action: string, private path: string)
  {
    super();
  }

  public async create(): Promise<FileOutput> {
    const devices = await this.client.listDevices();

    const { id, code, action, path } = this;

    if (!devices.find(d => d.id === id)) throw "device not found";
    const lock: Lock = Lock.instance;

    console.log("action params ->> ", {code, id});
    const valid = lock.valid(id, code);
    if(!valid)  throw "invalid session";

    const result = await this.getFile(id, action, path);
    return { result };
  }

  private async getFile(id: string, action: string, filePath: string): Promise<any> {
    try {
      const activity = this.client.activity();
      await activity.startActivity(id, action)
      const stream = await this.client.pull(id, filePath);
      return new Promise((resolve, reject) => {
        var reject_copy: any = reject;
        var content = "";
        stream.on("data", data => content += data);
        stream.on("error", err => {
          !!reject_copy && reject_copy(err);
          reject_copy = undefined;
        });
        stream.on("end", () => {
          if (!reject_copy) return;
          try {
            resolve(JSON.parse(content));
          } catch(err) {
            reject_copy(err);
            reject_copy = undefined;
          }
        });
      });
    } catch(err) {
      console.log("obtained error for getFile", err);
      throw err;
    }
  }
}