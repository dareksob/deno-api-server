interface IPatternDescribe {
    pattern: string,
    transform: (v: string) => any,
}

// define pattern map
export const patternMap = new Map<any, IPatternDescribe>();

patternMap.set('Any', {
    pattern: '([a-zA-Z0-9.\\-_]+)',
    transform: (v: string) => v,
});
patternMap.set(Number, {
    pattern: '([0-9]+|[0-9]+.[0-9]+)',
    transform: (v: string) => parseFloat(v)
});
patternMap.set('Int', {
    pattern: '([0-9]+)',
    transform: (v: string) => parseInt(v)
});
