import Loggable from "./Loggable";
export default class WebSocketClient extends Loggable {
    #private;
    private master;
    constructor(master: string);
    private onCommandReceived;
    private onConnect;
}
