import { IResponse, IStateMap } from '../definition/types.ts';
import { ServerRequest } from '../deps.ts';
import { IMatcher, UriMatch } from './matcher.ts';

export class Route {
    public readonly methods : string[];
    public readonly matcher : IMatcher; 
    protected pipes : Function[] = [];

    public readonly params : IStateMap = new Map();
    public readonly state : IStateMap = new Map();
    public url?: URL;
    public request?: ServerRequest;
    public response?: IResponse;

    /**
     * @param method 
     * @param uri 
     */
    constructor(method: string[] | string, uri : IMatcher | string) {
        // set methods
        if (! Array.isArray(method)) {
            this.methods = [method];
        }
        this.methods = method.map(m => `${m}`.toUpperCase());

        // set uri
        if (typeof uri === 'string') {
            this.matcher = new UriMatch(uri);
        } else {
            this.matcher = uri;
        }
    }

    public isMatch(url: URL): boolean {
        const match = this.matcher.getMatch(url);
        if (match) {
            
        }

        return 
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

        this.params.clear();
        this.state.clear();

        for (let pipe in this.pipes) {
            await this.pipes[pipe](this, response);
        }
    }
}