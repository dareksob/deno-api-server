import { assertEquals, assertThrows } from "../dev_deps.ts";
import { Route } from "./route.ts";
import { mockFn, mockRequest } from "../../dev_mod.ts";

const host = "http://localhost";

Deno.test("Route should be constructable", () => {
  const route = new Route("GET", "/test");
  assertEquals(true, route instanceof Route);
  assertEquals(["GET"], route.methods);
  assertEquals(typeof route.matcher, 'object');
  assertEquals(typeof route.matcher.getMatch, 'function');
});

Deno.test("Route should append pipes", async () => {
  const url = new URL("/test", host);
  const route = new Route("GET", "/test");
  const request = mockRequest("GET", "/test");
  const response = { status: 200, headers: new Headers() };

  // setup mock
  // @ts-ignore
  const fn = mockFn(({ state }) => state.set("super", "man"));
  route.addPipe(fn);

  const ctx = await route.execute(url, request, response);

  assertEquals(fn.mock.calls.length, 1);
  assertEquals(ctx.response.status, 200);

  // is clear but can define inside pipes
  assertEquals(ctx.state.get("super"), "man");
});

Deno.test("Route can have props", async () => {
  const route = new Route("GET", "/test");

  route.prop("test", "any");
  assertEquals(route.props.has("test"), true);
  assertEquals(route.props.get("test"), "any");
});

Deno.test("Route can inject service", async () => {
  const route = new Route("GET", "/test");

  const service = () => {};

  assertEquals(route.di.hasOwnProperty("test"), false);
  route.inject("test", service);
  assertEquals(route.di.hasOwnProperty("test"), true);

  assertThrows(
    () => {
      route.inject("test", "any");
    },
    Error,
    "Service test already injected",
  );
});
