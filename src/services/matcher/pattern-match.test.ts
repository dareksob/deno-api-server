import { assertEquals, assertNotEquals, assertThrows } from "../../dev_deps.ts";
import { PatternMatch } from "./pattern-match.ts";
import { EPatternTypes } from "../../definition/pattern-map.ts";

const host = "http://localhost";
Deno.test("PatternMatch for basic match", () => {
  const url = new URL("/test/frank/detail/show", host);
  const matcher = new PatternMatch("/test/:name/:view/show");

  assertNotEquals(
    matcher.getMatch(
      new URL("/test/frw", host)
    ),
    undefined,
  );

  const match = matcher.getMatch(url);

    assertEquals(
      typeof match,
      "object",
    );

    assertEquals(
      match?.params,
      { 
        name: 'frank',
        view: 'detail'
      },
    );
});