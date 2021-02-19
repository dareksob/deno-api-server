export interface IServerConfig { 
    hostname?: string, 
    port: number
 };

 //@ts-ignore
export interface IStateMap {
    [key: string]: any
}

export interface IResponse { 
    status: number,
    message?: string,
    body?: any,
    headers: Headers
 };

 //export interface IPipe : () => void;