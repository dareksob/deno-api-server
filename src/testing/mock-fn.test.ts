import { assertEquals } from '../dev_deps.ts';
import { mockFn } from './mock-fn.ts';

Deno.test('mockFn should handle mock method', () => {
    assertEquals(typeof mockFn, 'function');
    assertEquals(typeof mockFn(), 'function');

    const fn = mockFn();
    assertEquals(fn.mock.calls.length, 0);

    fn();    
    assertEquals(fn.mock.calls.length, 1);
    
    fn('super', 'top');    
    assertEquals(fn.mock.calls.length, 2);
    
    assertEquals(fn.mock.calls, [
        [],
        [ 'super', 'top' ]
    ]);
});


Deno.test('mockFn should handle custom implementation', async () => {
    let say = 'nothing';
    const fn = mockFn(() => say = 'sobczak');
    fn();
    assertEquals(say, 'sobczak');

    // should functional as promise

    const asyncfn = mockFn( async () => { say = 'delay' });
    await asyncfn();
    assertEquals(say, 'delay');
});