import { assertEquals } from "../dev_deps.ts";
import { mockFn } from "./mock-fn.ts";

Deno.test("mockFn should handle mock method", () => {
  assertEquals(typeof mockFn, "function");
  assertEquals(typeof mockFn(), "function");

  const fn = mockFn();
  assertEquals(fn.mock.calls.length, 0);

  fn();
  assertEquals(fn.mock.calls.length, 1);

  fn("super", "top");
  assertEquals(fn.mock.calls.length, 2);

  assertEquals(fn.mock.calls, [
    [],
    ["super", "top"],
  ]);
});

Deno.test("mockFn should handle custom implementation", async () => {
  let say = "nothing";
  const fn = mockFn(() => say = "sobczak");
  fn();
  assertEquals(say, "sobczak");

  // should functional as promise

  const asyncfn = mockFn(async () => {
    say = "delay";
  });
  await asyncfn();
  assertEquals(say, "delay");
});

Deno.test("mockFn can be implement new function after creation", async () => {
  const fn = mockFn(() => "first");

  assertEquals(fn.mock.calls.length, 0);
  fn(1);
  assertEquals(fn.mock.calls.length, 1);
  assertEquals(fn.mock.returns.length, 1);
  assertEquals(fn.mock.calls[0][0], 1);
  assertEquals(fn.mock.returns[0], "first");

  fn.mock.implement(() => "super");
  fn(2);
  assertEquals(fn.mock.calls.length, 2);
  assertEquals(fn.mock.returns[1], "super");
});
