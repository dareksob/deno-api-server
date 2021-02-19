import { assertEquals } from '../dev_deps.ts';
import { Route } from './route.ts'; 
import { mockRequest, mockFn } from '../dev_mod.ts';

Deno.test('Route should be constructable', () => {
    const route = new Route('GET', '/test');
    assertEquals(true, route instanceof Route);
    assertEquals(['GET'], route.method);
    assertEquals(new RegExp('/test'), route.uri);
});

Deno.test('Route should append pipes', async () => {
    const route = new Route('GET', '/test');
    const request = mockRequest('GET', '/test');
    const response = { status: 200, headers: new Headers };
    
    // setup mock
    const fn = mockFn((route: Route) => route.state.set('super', 'man'));
    route.addPipe(fn);

    route.state.set('any', 'sobczak');

    // test
    assertEquals('sobczak', route.state.get('any'));

    await route.execute(request, response);

    assertEquals(fn.mock.calls.length, 1);
    assertEquals([route, response], fn.mock.calls[0]);
    assertEquals(response.status, 200);
    
    // is clear but can define inside pipes
    assertEquals(route.state.get('any'), undefined);
    assertEquals(route.state.get('super'), 'man');
    
});