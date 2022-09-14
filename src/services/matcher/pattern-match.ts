import { IMatcher, IMatching } from "../../definition/types.ts";

export class PatternMatch implements IMatcher {
  public readonly pattern: URLPattern;

  constructor(pattern: URLPattern | string) {
    this.pattern = typeof pattern === 'string' 
      ? new URLPattern({ pathname: pattern })
      : pattern;
  }

  public get uri() {
    return this.pattern.pathname;
  }

  public getMatch(url: URL): IMatching {
    if (this.pattern.test(url)) {
      const match = this.pattern.exec(url);

      return {
        url,
        uri: this.uri,
        params: match.pathname.groups,
        matches: match,
      };
    }

    return null;
  }
}
