export default class ErrorEvent extends Event {
  public error: Error;
  public params: Record<string, unknown>;

  constructor(type: string, error: Error, params: Record<string, unknown> = {}) {
    super(type);
    this.error = error;
    this.params = params;
  }
}
