
import { IStateMap } from '../definition/types.ts';


interface IMatch {
    params?: IStateMap;
    url: URL;
    uri: string;
    matches?: RegExpMatchArray,
}

type IMaching = IMatch | null;

export interface IMatcher {
    getMatch(url: URL) : IMaching; 
};

export class UriMatch implements IMatcher {
    public readonly uri: string;

    constructor (uri: string) {
        this.uri = uri;
    }
    
    public getMatch(url: URL) : IMaching {
        if (this.uri == url.pathname) {
            return {
                url,
                uri: this.uri
            };
        }

        return null;
    }
}


interface IKeyDescribe {
    type?: any,
    optional?: boolean,
    key?: string,
    transform?: Function,
}

interface IKeyDescribes {
    [key: string]: IKeyDescribe
}

const PATTERN_MAP = new Map<any, any>();
PATTERN_MAP.set('Any', {
    pattern: '([a-zA-Z0-9.\\-_]+)',
    transform: (v: string) => v,
});
PATTERN_MAP.set(Number, {
    pattern: '([0-9]+|[0-9]+.[0-9]+)',
    transform: (v: string) => parseFloat(v)
});
PATTERN_MAP.set('Int', {
    pattern: '(\d+)',
    transform: (v: string) => parseInt(v)
});

export class KeyMatch implements IMatcher {
    public readonly uri: string;
    public readonly describe: IKeyDescribes;
    public readonly pattern: RegExp;
    protected keyGroups : string[] = [];

    constructor (uri: string, describe: IKeyDescribes) {
        this.uri = uri;
        this.describe = describe;
        let pattern = `${uri}`;

        for (const key in describe) {
            const item = describe[key];
            const itemKey = `:${key}`;

            item.type = PATTERN_MAP.has(item.type) ? item.type : 'Any';
            const keyPattern = PATTERN_MAP.get(item.type);
            item.key = itemKey;
            item.transform = keyPattern.transform;
            
            pattern = pattern.replace(itemKey, keyPattern.pattern); 
            this.keyGroups.push(key);
        }

        this.pattern = new RegExp(`^${pattern}$`);

    }
    
    public getMatch(url: URL): IMaching {
        const { pathname } = url;
        const matches = this.pattern.exec(pathname);

        if (matches?.length) {
            const params : IStateMap = new Map();

            matches.forEach((value: string, index: number) => {
                const keyIndex = index - 1;
                if (this.keyGroups.hasOwnProperty(keyIndex)) {
                    const key = this.keyGroups[keyIndex];
                    const describe = this.describe[key];

                    if (describe && describe.transform) {
                        value = describe.transform(value);
                    }

                    params.set(
                        key,
                        value
                    );
                }
            });

            return {
                url,
                uri: this.uri,
                matches,
                params,
            };
        }

        return null;
    }
}