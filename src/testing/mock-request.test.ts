import { assertEquals } from "../dev_deps.ts";
import { ServerRequest } from "../deps.ts";
import { mockRequest } from "./mock-request.ts";

Deno.test("mockRequest should be a ServerRequest generator", () => {
  assertEquals("function", typeof mockRequest);
  assertEquals(true, mockRequest("GET", "/") instanceof ServerRequest);
});
