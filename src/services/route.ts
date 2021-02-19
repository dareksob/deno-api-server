import { IResponse } from '../definition/types.ts';
import { ServerRequest } from '../deps.ts';

export class Route {
    protected methods : string[] = [];
    protected uriPattern : RegExp; 
    protected pipes : Function[] = [];

    public state = new Map();
    public request?: ServerRequest;
    public response?: IResponse;

    /**
     * @param method 
     * @param uri 
     */
    constructor(method: string[] | string, uri : RegExp | string) {
        if (! Array.isArray(method)) {
            method = [method];
        }

        if (typeof uri === 'string') {
            uri = new RegExp(uri);
        }

        this.methods = method.map(m => `${m}`.toUpperCase());
        this.uriPattern = uri;
    }

    get method() : string[] {
        return this.methods;
    }

    get uri() : RegExp {
        return this.uriPattern;
    }

    /**
     * add route pipe
     * 
     * @param pipe 
     */
    public addPipe(pipe: Function) : Route {
        this.pipes.push(pipe);
        return this;
    }

    /**
     * execute route
     */
    public async execute(request: ServerRequest, response: IResponse) {
        this.request = request;
        this.response = response;
        this.state.clear();

        for (let pipe in this.pipes) {
            await this.pipes[pipe](this, response);
        }
    }
}