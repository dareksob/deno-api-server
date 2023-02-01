import {assertCalledCount} from "../../src/dev_deps.ts";
import { mockApi, mockFn } from "../../dev_mod.ts";
import { Route } from "../../mod.ts";
import plugin from "./plugin.ts";


Deno.test("Access log plugin", async () => {
  const route = new Route("GET", "/hello");
  const log = mockFn();

  // create api
  const api = mockApi(route);

  // install plugin
  plugin(api, { log });

  assertCalledCount(log, 0);

  await api.sendByArguments("GET", "/hello");

  assertCalledCount(log, 1);
});