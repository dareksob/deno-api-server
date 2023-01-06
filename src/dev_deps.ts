export * from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

/**
 * check if function called n times
 */
export function assertCalledCount(mockedFn: any, count: number) {
  assertEquals(mockedFn.mock.calls.length, count);
}

/**
 * check if called with arguments
 */
export function assertCalledWith(mockedFn: any, calledAt: number, params: unknown[]) {
  const args: unknown[] = mockedFn.mock.calls.at(calledAt);
  assertEquals(Array.isArray(args), true, `Method not called on index ${calledAt}`);
  assertEquals(args, params);
}

/**
 * check if called with value in argument
 */
export function assertCalledWithAt(mockedFn: any, calledAt: number, paramIndex: number, value: unknown) {
  const args: unknown[] = mockedFn.mock.calls.at(calledAt);
  assertEquals(Array.isArray(args), true, `Method not called on index ${calledAt}`);
  assertEquals(args.at(paramIndex), value);
}