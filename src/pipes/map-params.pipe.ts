import { Route } from '../services/route.ts';

type StringArray = string[];
type Describe = {
    [key: string] : any
};

/**
 * map uri groups and set params map
 */
export default function mapParamsPipe (describe: StringArray | Describe) {
    const isArray = Array.isArray(describe);
    const keys : string[] = isArray ? describe : Object.keys(describe);
    const presets : any[] = isArray ? [] : Object.values(describe);

    return async (route: Route) => {
        let url : URL = route.state.get('url');

        if (!url && route.request) {
            url = new URL(route.request.url, 'http://localhost');
            route.state.set('url', url);
        }

        if (url instanceof URL) {
            const match = url.pathname.match(route.uri);
            route.state.set('uriMatch', match);

            if (match) {
                keys.forEach((key, index) => {
                    const matchIndex = index + 1;

                    // set by group match
                    if (match.hasOwnProperty(matchIndex)) {
                        route.params.set(key, match[matchIndex]);
                    }
                    // preset
                    else if (presets.hasOwnProperty(matchIndex)) {
                        route.params.set(key, presets[matchIndex]);
                    }
                });
            }
        }
    }
}