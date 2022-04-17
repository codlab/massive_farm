export default abstract class AbstractCommandAnswer<OUTPUT> {
    abstract create(): Promise<OUTPUT>;
}
