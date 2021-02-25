import { ServerRequest } from '../deps.ts';

export type IRequest = ServerRequest;

export interface IServerConfig {
    hostname?: string, 
    port: number
 }

 //@ts-ignore
export interface IStateMap {
    [key: string]: any
}

export interface IInjections {
    [key: string]: any
}

export interface IResponse { 
    status: number,
    message?: string,
    body?: any,
    headers: Headers
 }

export interface IRoute {}

export interface IMatch {
    params: IStateMap;
    url: URL;
    uri: string;
    matches?: RegExpMatchArray,
}

export type IMatching = IMatch | null;

export interface IMatcher {
    getMatch(url: URL) : IMatching;
}

export interface IKeyDescribe {
    type?: any,
    key?: string,
    transform?: Function,
}

export interface IKeyDescribes {
    [key: string]: IKeyDescribe
}

export interface IContext {
    route: IRoute,
    di: IInjections,
    match: IMatch,
    url: URL,
    request: ServerRequest
    response: IResponse,
    state: IStateMap,
}

export type IPipe = (context: IContext) => void;