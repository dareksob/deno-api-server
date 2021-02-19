import { assertEquals } from '../dev_deps.ts';
import { Route } from '../services/route.ts';
import { mockRequest } from '../dev_mod.ts';
import mapParamsPipe from './map-params.pipe.ts';

Deno.test('Pipe mapParamsPipe should set params', () => {
    assertEquals(typeof mapParamsPipe, 'function');
    
    const pipe = mapParamsPipe([
        'id'
    ]);
    assertEquals(typeof pipe, 'function');

    const route = new Route('GET', /^\/test\/([0-9])/);
    route.request = mockRequest('GET', '/test/5');
    pipe(route);

    
    assertEquals(route.state.has('url'), true);
    assertEquals(route.state.has('uriMatch'), true);
    
    assertEquals(route.params.has('id'), true);
    assertEquals(route.params.get('id'), '5');
});

Deno.test('Pipe mapParamsPipe should set params with default', () => {
    assertEquals(typeof mapParamsPipe, 'function');
    
    const pipe = mapParamsPipe({
        id: null,
        name: 'sobczak'
    });
    assertEquals(typeof pipe, 'function');

    const route = new Route('GET', /^\/test\/([0-9])\/([a-z]+)/);
    route.request = mockRequest('GET', '/test/5');
    pipe(route);

    
    assertEquals(route.state.has('url'), true);
    assertEquals(route.state.has('uriMatch'), true);
    
    assertEquals(route.params.has('id'), true);
    assertEquals(route.params.get('id'), '5');
});
