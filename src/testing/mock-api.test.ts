import { assertEquals } from "../dev_deps.ts";
import mockApi from "./mock-api.ts";
import { Api } from "../../mod.ts";

const suiteName = "mockApi";

Deno.test(`${suiteName} should be mock api request by arguments.`, async () => {
  assertEquals(typeof mockApi, "function");
  const api = mockApi();

  assertEquals(api instanceof Api, true);

  await api.sendByArguments("GET", "/");
  assertEquals(api.lastContext?.response.status, 404);
});
