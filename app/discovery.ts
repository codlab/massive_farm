import dgram, { Socket } from "dgram";
import Config from "./server/Config";
import os from "os";
import broadcastAddress from "broadcast-address";

const config: Config = require("../config.json");

export type Mode = "normal"|"slave"|"master"|null|undefined;

export interface OnServerFound {
  (address: string, port: number): void;
}


const PORT_SLAVE = 1733;
const PORT_SERVER = 1732

export default class DiscoveryService {
  _bound: boolean = false;
  private sockets: Socket[] = [];
  private mode: Mode;

  private interfaces: Map<string, Socket> = new Map();

  constructor(mode?: Mode) {
    this._bound = false;
    this.mode = mode;
  }

  bind() {
    if(this._bound) return;
    this._bound = true;

    switch(this.mode) {
      case "slave":
        this.bindServer(PORT_SLAVE);
        break;
      case "master":
        this.initMaster();
        if(config.server.discovery) {
          this.bindServer(PORT_SERVER);
        }
        break;
      case null:
      case undefined:
      default:
        if(config.server.discovery) {
          this.bindServer(PORT_SERVER);
        }
    }
  }

  private _masterLoop = () => {
    const object: any = os.networkInterfaces();
    if(object) {
      const keys: string[] = Object.keys(object);
      keys.forEach(key => {
        if(!this.interfaces.has(key)) {
          const socket = this.bindSearch(key);
          this.interfaces.set(key, socket);
        }
      })
    }
  };

  private initMaster() {
    this._masterLoop();
    setInterval(() => this._masterLoop(), 20000);
  }

  private broadcastAddress(interf: string): string|null {
    try {
      return broadcastAddress(interf);
    } catch(e) {
      return null;
    }
  }

  private bindSearch(interf: string): Socket {
    const json = { discover: true };
    var message = new Buffer(JSON.stringify(json));
    var client = dgram.createSocket("udp4");
    
    client.on("message", (message, rinfo) => {
      try {
        const json = JSON.parse(message.toString());
        console.log("received..." + rinfo.address+" "+rinfo.port, json);
      } catch(e) {
        console.log("received invalid");
      }
    });
    
    client.bind(() => {
      console.log(`bind for ${interf}...`);
      client.setBroadcast(true);
    
      const callback = () => {
        try {
          const broadcastAddr = this.broadcastAddress(interf);
          if(!broadcastAddr) return;
          console.log(`sent ${broadcastAddr} on port ${PORT_SLAVE}...`);
          client.send(message, 0, message.length, PORT_SLAVE, broadcastAddr);
        } catch(e) {
          console.log("can't send on " + interf, e);
        }
      }
    
      callback();
      
      setInterval(callback, 20 * 1000);
    });

    return client;
  }

  private bindServer(port: number) {
    const server = dgram.createSocket("udp4");
    server.on("listening", () => { });

    server.on("message", (message: string, rinfo) => {
      try {
        const json = JSON.parse(message);
        if(json.discover) {
          const replay = { service: "massive_farm", data: { "port": config.server ? config.server.port : 0 } };

          const message = new Buffer(JSON.stringify(replay));
          console.log("send replay to "+rinfo.address+" "+rinfo.port);
          server.send(message, 0, message.length, rinfo.port, rinfo.address);
        }
      } catch(e) {
        console.log(e);
      }
    });
    server.bind(port);

    this.sockets.push(server);
  }
}