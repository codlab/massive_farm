export default class Lock {
    private locks;
    static instance: Lock;
    private constructor();
    private checkForClear();
    valid(id: string, code: string): boolean;
    available(id: string): boolean;
    reserve(id: string, code: string): Promise<boolean>;
    release(id: string, code: string): Promise<boolean>;
}
