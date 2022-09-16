import { assertEquals, assertNotEquals, assertThrows } from "../../dev_deps.ts";
import { KeyMatch } from "./key-match.ts";
import { EPatternTypes } from "../../definition/pattern-map.ts";

const host = "http://localhost";

Deno.test("KeyMatch key match by typeing", () => {
  const url = new URL("/test/23/sdsd", host);
  const matcher = new KeyMatch("/test/:id/:name", {
    id: {
      type: EPatternTypes.NUMBER,
    },
    name: {},
  });

  assertNotEquals(
    matcher.getMatch(url),
    null,
  );

  const match = matcher.getMatch(url);
  assertEquals(match?.params?.get("id"), 23);
  assertEquals(match?.params?.get("name"), "sdsd");

  assertEquals(
    matcher.getMatch(new URL("/test/sdsd/hallo", host)),
    null,
  );

  const match2 = matcher.getMatch(
    new URL("/test/39448/das-ist-ein-haus_vom", host),
  );

  assertEquals(
    match2?.params?.get("id"),
    39448,
  );

  assertEquals(
    matcher.getMatch(new URL("/test/39.448/das", host))?.params?.get("id"),
    39.448,
  );
});

Deno.test("KeyMatch key match throw missing keys", () => {
  assertThrows((): void => {
    // throw by invalid matching if uid and id definition
    new KeyMatch("/test/:uid/:name", {
      id: {
        type: "Number",
      },
      name: {},
    });
  });
});

Deno.test("KeyMatch can resolve any ", () => {
  const matcher = new KeyMatch("/test/:id/:path", {
    id: { type: "number" },
    path: {},
  });
  const match = matcher.getMatch(new URL("/test/39.448/das", host));

  assertEquals(
    match?.params?.get("id"),
    39.448,
  );

  assertEquals(
    match?.params?.get("path"),
    "das",
  );
});

Deno.test("KeyMatch can resolve rest of url for match", () => {
  const matcher = new KeyMatch("/test/:id/:path", {
    id: {},
    path: {
      type: EPatternTypes.REST,
    },
  });

  assertEquals(
    matcher.getMatch(new URL("/test/39.448/das/is/wonder1-women", host))?.params
      ?.get("path"),
    "das/is/wonder1-women",
  );
});

Deno.test("KeyMatch can use custom types", () => {
  const matcher = new KeyMatch("/test-as2-2/:id", {
    id: {
      describe: {
        pattern: "([a-z]{1})",
        transform: (v: string) => v.toUpperCase(),
      },
    },
  });
  const match = matcher.getMatch(new URL("/test-as2-2/a", host));
  assertEquals(!!match, true);

  assertEquals(
    match?.params?.get("id"),
    "A",
  );
});
