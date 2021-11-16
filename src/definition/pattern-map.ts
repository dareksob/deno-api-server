import { IPatternDescribe } from "./types.ts";

export enum EPatternTypes {
  ANY = "Any",
  INT = "Int",
  NUMBER = "Number",
  ALPHA = "Alpha",
  HASH = "Hash",
  REST = "Rest",
}

// define pattern map
type TPattern = EPatternTypes | string;
export const patternMap = new Map<TPattern, IPatternDescribe>();

patternMap.set(EPatternTypes.ANY, {
  pattern: "([a-zA-Z0-9.\\-_]+)",
  transform: (v: string) => v,
});
patternMap.set(EPatternTypes.NUMBER, {
  pattern: "([0-9]+|[0-9]+.[0-9]+)",
  transform: (v: string) => parseFloat(v),
});

patternMap.set(EPatternTypes.INT, {
  pattern: "([0-9]+)",
  transform: (v: string) => parseInt(v),
});

patternMap.set(EPatternTypes.ALPHA, {
  pattern: "([a-zA-Z]+)",
  transform: (v: string) => v,
});

patternMap.set(EPatternTypes.HASH, {
  pattern: "([a-zA-Z0-9]+)",
  transform: (v: string) => v,
});

patternMap.set(EPatternTypes.REST, {
  pattern: "(.*)$",
  transform: (v: string) => v,
});

// add aliases
[
  [EPatternTypes.ANY, "any"],
  [EPatternTypes.ALPHA, "alpha"],
  [EPatternTypes.NUMBER, "number"],
  [EPatternTypes.INT, "int"],
  [EPatternTypes.HASH, "hash"],
  [EPatternTypes.REST, "rest"],
  [EPatternTypes.REST, "*"],
].forEach((conf) => {
  const [key, alias] = conf;
  if (patternMap.has(key)) {
    patternMap.set(alias, patternMap.get(key) as IPatternDescribe);
  }
});
