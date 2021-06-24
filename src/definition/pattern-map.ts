import { IllegalArgumentError } from '../errors/illegal-argument.error.ts';
import { IPatternDescribe } from './types.ts';

export enum EPatternTypes {
    ANY = 'Any',
    INT = 'Int',
    NUMBER = 'Number',
    ALPHA = 'Alpha',
    REST = 'Rest'
}

// define pattern map
type TPattern = EPatternTypes | string;
export const patternMap = new Map<TPattern, IPatternDescribe>();

patternMap.set(EPatternTypes.ANY, {
    pattern: '([a-zA-Z0-9.\\-_]+)',
    transform: (v: string) => v,
});
patternMap.set(EPatternTypes.NUMBER, {
    pattern: '([0-9]+|[0-9]+.[0-9]+)',
    transform: (v: string) => parseFloat(v)
});

patternMap.set(EPatternTypes.INT, {
    pattern: '([0-9]+)',
    transform: (v: string) => parseInt(v)
});

patternMap.set(EPatternTypes.ALPHA, {
    pattern: '([a-zA-Z]+)',
    transform: (v: string) => v,
});

patternMap.set(EPatternTypes.REST, {
    pattern: '(.*)$',
    transform: (v: string) => v,
});

/**
 * function to extend pattern map for key match
 *
 * @param {TPattern} key
 * @param {IPatternDescribe} describe
 * @throws IllegalArgumentError
 */
export function extendPatternMap(key: TPattern, describe: IPatternDescribe) {
    if (patternMap.has(key)) {
        throw new IllegalArgumentError(`Key ${key} for PatternMap already defined`);
    }

    patternMap.set(key, describe);
}