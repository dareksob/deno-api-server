import { assertEquals } from "../dev_deps.ts";
import { mockResponse } from "./mock-response.ts";

Deno.test("mockResponse should be a IResponse", () => {
  assertEquals(typeof mockResponse, "function");
  const r = mockResponse();
  assertEquals(r.status, 200);
  assertEquals(r.headers instanceof Headers, true);
});
