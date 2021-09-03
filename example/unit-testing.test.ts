/**
 * example how to test your api
 */

import {assertEquals, assertThrowsAsync} from "https://deno.land/std@0.104.0/testing/asserts.ts";
import {AccessDeniedError, EMethod, IContext, RequestError, Route} from '../mod.ts';

// use build-in mocks
import {mockApi, mockRequest, mockResponse, mockContext} from '../dev_mod.ts';
import jsonBodyPipe from "../src/presets/pipes/body/json-body.pipe.ts";


/**
 * example by using a api mock
 */
Deno.test('Example mockApi sendByArguments', async () => {
    const route = new Route('GET', '/hello');

    // create api
    const api = mockApi(route);

    await api.sendByArguments('GET', '/hello');

    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.status, 200);
})

/**
 * example by using a api mock
 */
Deno.test('Example mockApi sendByRequest', async () => {
    const route = new Route('GET', '/hello');

    // create api
    const api = mockApi(route);

    const request = mockRequest('GET', '/hello');
    await api.sendByRequest(request);

    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.status, 200);
})

Deno.test('Example mockApi post request with request data', async () => {
    const route = new Route('POST', '/submit');
    route
        .addPipe(jsonBodyPipe)
        .addPipe(({state, response}) => {
            response.status = 201;
            response.body = state.get('body');
        });

    const api = mockApi(route);

    const request = mockRequest('POST', '/submit', {
        name: 'super'
    });
    await api.sendByRequest(request);

    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.status, 201);
    assertEquals(api?.lastContext?.response.body, { name: 'super' });
});

/**
 * example to testing routes by simple response
 */

Deno.test('Route example will be 200 with mocks', async () => {
    // setup route
    const route = new Route('GET', '/hello')
        .addPipe(({response, request}) => {
            response.body = {
                kind: 'test',
                header: request.headers.get('test-env'),
            };
        });

    // setup request objects
    const url = new URL('/hello', 'http://localhost');
    const request = mockRequest('GET', url.pathname);
    const response = mockResponse();

    // add request params like headers
    request.headers.set('test-env', 'deno test');
    assertEquals(request.headers.get('test-env'), 'deno test');

    // execute route and use context to check aspectation
    const context = await route.execute(url, request, response);

    assertEquals(context.response.status, 200);
    assertEquals(context.response.body, {
        kind: 'test',
        header: 'deno test'
    });
});


/**
 * example to testing routes on errors
 */
Deno.test('Route example will throw request error', async () => {
    // create route
    const routeError = new Route('GET', '/hello')
        .addPipe(({response, request}) => {
            throw new RequestError('error x', 400);
        });

    // set request objects
    const url = new URL('/hello', 'http://localhost');
    const request = mockRequest('GET', url.pathname);
    const response = mockResponse();

    assertThrowsAsync(
        () => routeError.execute(url, request, response),
        RequestError, 'error x'
    );
});
/**
 * example by using a api
 */
Deno.test('Example mockApi route success request', async () => {
    const route = new Route('POST', '/hello')
        .addPipe(() => {
            throw new RequestError('api error', 400);
        });

    // create api
    const api = mockApi(route);

    await api.sendByArguments('POST', '/hello');

    // info lastContext have only url request and response props
    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.status, 400);
});

/**
 * example by using injection services of route
 */
Deno.test('Example mockApi route to mock injections', async () => {
    const route = new Route('POST', '/hello')
        .injections({
            getConnection(name: string) {
                return {
                    list() {
                        return Promise.resolve(['fake-db'])
                    }
                };
            }
        })
        .addPipe(async ({di, response}) => {
            const db = di.getConnection();
            const items = await db.list();
            response.body = items;
        });

    // create api
    const api = mockApi(route);

    /**
     * not yet mocked, route will use this current implementation
     */
    await api.sendByArguments('POST', '/hello');
    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.body, ['fake-db']);

    /**
     * with mock example of route injections
     */
    api.mockInjections({
        getConnection(name: string) {
            return {
                list() {
                    return Promise.resolve(['mocked'])
                }
            };
        }
    });

    await api.sendByArguments('POST', '/hello');
    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.body, ['mocked']);
});


/**
 * example how you can test your custom pipes
 */
Deno.test('Example for testing custom pipes', async () => {
    const myPipe = (context: IContext) => {
        context.response.headers.set('custom', 'xxxx');
    };

    const context = mockContext({}); // @see mock-context.ts#ISetting
    assertEquals(context.response.headers.get('custom'), null);

    await myPipe(context);

    assertEquals(context.response.headers.get('custom'), 'xxxx');
})

import * as diTestServices from './fixtures/service-x.ts';
Deno.test('Testing for module injetion in routes', async () => {
    const routeUrl = '/testing/di';
    const routeMethod = EMethod.GET;

    const route = new Route(routeMethod, routeUrl);
    route.injections(diTestServices);
    route.addPipe(({response, di}) => response.body = {out: di.serviceX()})

    const api = mockApi(route);
    api.mockInjections({
        serviceX: () => 'mockedX'
    })

    const request = mockRequest(routeMethod, routeUrl);
    await api.sendByRequest(request);

    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.body, { out: 'mockedX' });
    assertEquals(api?.lastContext?.response.status, 200);
});

Deno.test('Testing api mocked status code', async () => {
    const routeUrl = '/testing/di';
    const routeMethod = EMethod.GET;

    const route = new Route(routeMethod, routeUrl);
    route.addPipe(() => new AccessDeniedError('403 error'));

    const api = mockApi(route);
    await api.sendByArguments(routeMethod, routeUrl);

    assertEquals(api.lastRoute === route, true);
    assertEquals(api?.lastContext?.response.status, 403);
});