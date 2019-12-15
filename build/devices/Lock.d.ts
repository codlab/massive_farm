export default class Lock {
    private locks;
    static instance: Lock;
    private constructor();
    private checkForClear();
    available(id: string): boolean;
    reserve(id: string, code: string): Promise<boolean>;
}
