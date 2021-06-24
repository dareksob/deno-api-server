import { IStateMap, IMatching, IMatcher, IKeyDescribes, IPatternDescribe } from '../../definition/types.ts';
import { patternMap, EPatternTypes } from '../../definition/pattern-map.ts';
import {IllegalArgumentError} from "../../errors/illegal-argument.error.ts";

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

            item.type = patternMap.has(item.type) ? item.type : EPatternTypes.ANY;

            const keyPattern = patternMap.get(item.type) as IPatternDescribe;
            item.key = itemKey;
            item.transform = keyPattern.transform;
            pattern = pattern.replace(itemKey, keyPattern.pattern);

            this.keyGroups.push(key);
        }

        // throw error if uri have some other pattern
        if (/\:[a-zA-Z]/.test(pattern)) {
            throw new IllegalArgumentError('Missing some uri parameter');
        }

        this.pattern = new RegExp(`^${pattern}$`);
    }

    /**
     * match url by complex pattern
     *
     * @param url
     */
    public getMatch(url: URL): IMatching {
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