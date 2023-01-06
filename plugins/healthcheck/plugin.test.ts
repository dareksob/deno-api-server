import { assertEquals } from "../../src/dev_deps.ts";
import { mockApi } from "../../dev_mod.ts";
import { Route } from "../../mod.ts";
import plugin from "./plugin.ts";


Deno.test("Healthcheck plugin", async () => {
  const route = new Route("GET", "/hello");

  // create api
  const api = mockApi(route);

  // install plugin
  plugin(api);

  await api.sendByArguments("GET", "/healthz");

  assertEquals(api?.lastContext?.response.status, 200);
});