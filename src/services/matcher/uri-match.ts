import {IMatching, IMatcher} from "../../definition/types.ts";

export class UriMatch implements IMatcher {
    public readonly uri: string;

    constructor (uri: string) {
        this.uri = uri;
    }

    public getMatch(url: URL) : IMatching {
        if (this.uri == url.pathname) {
            return {
                url,
                uri: this.uri
            };
        }

        return null;
    }
}