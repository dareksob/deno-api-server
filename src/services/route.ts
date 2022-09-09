import {
  BreakPipe,
  IContext,
  IInjections,
  IMatcher,
  IPipe,
  IRequest,
  IResponse,
  IRoute,
  IStateMap,
} from "../definition/types.ts";
import { UriMatch } from "./matcher/uri-match.ts";
import { RequestError } from "../errors/request.error.ts";

export class Route implements IRoute {
  public readonly methods: string[];
  public readonly matcher: IMatcher;
  public readonly props: IStateMap = new Map();
  protected pipes: Function[] = [];
  public di: IInjections = {};
  public parent?: any;

  /**
     * @param method
     * @param uri
     */
  constructor(method: string[] | string, uri: IMatcher | string) {
    // set methods
    if (!Array.isArray(method)) {
      method = [method];
    }
    this.methods = method.map((m) => `${m}`.toUpperCase());

    // set uri
    if (typeof uri === "string") {
      this.matcher = new UriMatch(uri);
    } else {
      this.matcher = uri;
    }
  }

  /**
     * route props
     *
     * @param name
     * @param value
     */
  public prop(name: string, value: any) {
    this.props.set(name, value);
    return this;
  }

  /**
     * @param name
     * @param service
     * @param overridable
     */
  public inject(name: string, service: any, overridable: boolean = false) {
    if (this.di.hasOwnProperty(name) && !overridable) {
      throw new Error(`Service ${name} already injected`);
    }
    this.di[name] = service;
    return this;
  }

  /**
     * injection of service
     * @param di
     */
  public injections(di: IInjections): Route {
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
  public addPipe(pipe: IPipe): IRoute {
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
  public async execute(
    url: URL,
    request: IRequest,
    response: IResponse,
  ): Promise<IContext> {
    const match = this.matcher.getMatch(url);

    if (match) {
      const context: IContext = {
        route: this,
        di: this.di,
        match,
        url,
        request,
        response,
        state: new Map<string, any>(),
      };

      for (let pipe in this.pipes) {
        const feedback = await this.pipes[pipe](context);

        // break pipe execute if command return
        if (feedback === BreakPipe) {
          break;
        }
      }

      return context;
    } else {
      throw new RequestError("Route cannot execute on invalid match");
    }
  }
}
