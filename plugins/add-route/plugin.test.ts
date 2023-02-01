import {assertCalledCount, assertCalledWithAt} from "../../src/dev_deps.ts";
import { mockApi, mockFn } from "../../dev_mod.ts";
import { Route } from "../../mod.ts";
import plugin from "./plugin.ts";

Deno.test("Add Route plugin", async () => {
  const log = mockFn();

  // create api
  const api = mockApi(); // no add route before plugin ready

  // install plugin
  plugin(api, { log });

  assertCalledCount(log, 0);
  api.addRoute(new Route("GET", "/hello"));
  assertCalledCount(log, 1);
  assertCalledWithAt(log, 0, 0, 'Add Route GET /hello')
});

Deno.test("Add Route plugin with custom title", async () => {
  const log = mockFn();

  // create api
  const api = mockApi(); // no add route before plugin ready

  // install plugin
  plugin(api, { log, title: 'New Route created' });

  assertCalledCount(log, 0);
  api.addRoute(new Route("POST", "/submit/:id"));
  assertCalledCount(log, 1);
  assertCalledWithAt(log, 0, 0, 'New Route created POST /submit/:id')
});