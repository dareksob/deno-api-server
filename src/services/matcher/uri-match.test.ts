import { assertEquals, assertNotEquals, assertThrows } from "../../dev_deps.ts";
import { UriMatch } from "./uri-match.ts";
import { EPatternTypes } from "../../definition/pattern-map.ts";

const host = "http://localhost";
Deno.test("UriMatch for basic match", () => {
  const url = new URL("/test", host);
  const matcher = new UriMatch("/test");

  assertNotEquals(
    matcher.getMatch(url),
    null,
  );

  const match = matcher.getMatch(url);
  assertEquals(
    match?.url.pathname,
    "/test",
  );

  assertEquals(
    match?.uri,
    "/test",
  );
});