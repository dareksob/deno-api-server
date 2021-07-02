import {
    IKeyDescribes,
    IMatcher,
    IMatching,
    IPatternDescribe,
    IStateMap
} from '../../definition/types.ts';
import {EPatternTypes, patternMap} from '../../definition/pattern-map.ts';
import {IllegalArgumentError} from "../../errors/illegal-argument.error.ts";

function assertType(value: any, type: string, msg: string) {
    if (!value || typeof value !== type) {
        throw new IllegalArgumentError(msg);
    }
}

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
            let keyPattern: IPatternDescribe;

            // resolve key pattern for matching
            if (item.describe && typeof item.describe === 'object') {
                keyPattern = item.describe as IPatternDescribe;

                if (!item.type) {
                    item.type = 'custom';
                }
            }
            else if (typeof item.type === 'string' && patternMap.has(item.type)) {
                keyPattern = patternMap.get(item.type) as IPatternDescribe;
            }
            else {
                item.type = EPatternTypes.ANY;
                keyPattern = patternMap.get(EPatternTypes.ANY) as IPatternDescribe;
            }

            // validate pattern
            assertType(keyPattern.pattern, 'string', 'Invalid pattern')
            assertType(keyPattern.transform, 'function', 'Invalid transform')

            if (/\(/.test(keyPattern.pattern)) {
                console.warn('Warning, pattern not define a group');
            }

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