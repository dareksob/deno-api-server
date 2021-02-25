import { RequestError } from './request.error.ts';

export class NotFoundError extends RequestError {
    constructor(message: string, prevent?: Error) {
        super(message, 404, prevent);
    }
}