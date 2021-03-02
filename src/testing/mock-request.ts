import { ServerRequest } from '../deps.ts';

/**
 * create server request object for testing
 * 
 * @param method 
 * @param url 
 */
export function mockRequest(method: string, url: string) : ServerRequest {
    const request = new ServerRequest();
    request.method = `${method}`.toUpperCase();
    request.url = url;
    request.headers = new Headers();
    return request;
}