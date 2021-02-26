import { IResponse, IPipe, IInjections, IRoute, IContext, IMatcher } from '../definition/types.ts';
import { ServerRequest } from '../deps.ts';
import { UriMatch } from './matcher/uri-match.ts';
import { RequestError } from '../errors/request.error.ts';

export class Route implements IRoute {
    public readonly methods : string[];
    public readonly matcher : IMatcher;
    protected pipes : Function[] = [];
    public di: IInjections = {};
    public parent?: any;

    /**
     * @param method 
     * @param uri 
     */
    constructor(method: string[] | string, uri : IMatcher | string) {
        // set methods
        if (! Array.isArray(method)) {
            method = [method];
        }
        this.methods = method.map(m => `${m}`.toUpperCase());

        // set uri
        if (typeof uri === 'string') {
            this.matcher = new UriMatch(uri);
        } else {
            this.matcher = uri;
        }
    }

    public injections(di: IInjections) : Route {
        this.di = di;
        return this;
    }

    /**
     * @param url
     */
    public isMatch(url: URL): boolean {
        const match = this.matcher.getMatch(url);
        if (match) {
            return true;
        }

        return false;
    }


    /**
     * add route pipe
     * 
     * @param pipe 
     */
    public addPipe(pipe: IPipe) : IRoute {
        this.pipes.push(pipe);
        return this;
    }

    /**
     * execute all pipes for current request
     *
     * @param url
     * @param request
     * @param response
     */
    public async execute(url: URL, request: ServerRequest, response: IResponse): Promise<IContext> {
        const match = this.matcher.getMatch(url);

        if (match) {
            const context: IContext = {
                route: this,
                di: this.di,
                match,
                url,
                request,
                response,
                state: new Map(),
            }

            for (let pipe in this.pipes) {
                await this.pipes[pipe](context);
            }

            return context;
        } else {
            throw new RequestError('Route cannot execute on invalid match');
        }
    }
}