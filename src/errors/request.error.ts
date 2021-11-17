export class RequestError extends Error {
  public readonly status: number;
  public readonly prevent: Error | undefined;

  constructor(message: string, status: number = 500, prevent?: Error) {
    super(message);
    this.status = status;
    this.prevent = prevent;
  }
}
