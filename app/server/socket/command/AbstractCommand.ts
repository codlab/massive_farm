export default abstract class AbstractCommandAnswer<OUTPUT> {
  public abstract create(): Promise<OUTPUT>;
}