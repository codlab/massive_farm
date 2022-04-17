import { Client } from "../../../../adb";
import Lock from "../../../../devices/Lock";
import AbstractCommand from "../AbstractCommand";
import { KeyValue } from "./ActionInput";

export interface ActionOutput {
  result: boolean;
}

export default class ActionAnswer extends AbstractCommand<ActionOutput> {
  public constructor(private client: Client, 
    private id: string, private code: string,
    private action: string, private options: KeyValue[])
  {
    super();
  }

  public async create(): Promise<ActionOutput> {
    const devices = await this.client.listDevices();

    const activity = this.client.activity();
    const { id, code, action, options } = this;

    if (!devices.find(d => d.id === id)) throw "device not found";
    const lock: Lock = Lock.instance;

    console.log("action params ->> ", {code, id});
    const valid = lock.valid(id, code);
    if(!valid)  throw "invalid session";

    const intent_args = {};
    options.forEach(({key, value}) => intent_args[key] = value);
    console.log("starting activity for ", {id, action, intent_args});

    const result = await activity.startActivity(id, action, intent_args);
    console.log("result ?", result);
    return { result };
  }
}