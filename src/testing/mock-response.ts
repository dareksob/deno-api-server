import { IResponse } from '../definition/types.ts';

/**
 * create response mock object
 */
export function mockResponse() : IResponse {
    return { status: 200, headers: new Headers };
}