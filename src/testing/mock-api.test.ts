import { assertEquals } from '../dev_deps.ts';
import mockApi from './mock-api.ts';

const suiteName = 'mockApi';

Deno.test(`${suiteName} should be mock api request by arguments ....WIP...`, () => {
    assertEquals(typeof mockApi, 'function');
});