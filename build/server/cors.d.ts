export default class Cors {
    static instance: Cors;
    private constructor();
    isOriginAccepted(origin: string): Promise<boolean>;
    cors(): any;
}
