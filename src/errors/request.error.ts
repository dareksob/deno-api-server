export class RequestError {
    public readonly status: number;
    public readonly message: string;
    public readonly prevent: Error | undefined;

    constructor(message: string, status: number = 500, prevent?: Error) {
        this.status = status;
        this.message = message;
        this.prevent = prevent;
    }
}