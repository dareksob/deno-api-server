// deno-lint-ignore no-explicit-any
import {EMethod, IServerConfig, Api, Route, RequestError, KeyMatch} from './mod.ts';

import statusRoute from './src/presets/routes/status.ts';
import healthzRoute from './src/presets/routes/healthz.ts';
import jsonBodyPipe from './src/presets/pipes/body/json-body.pipe.ts';
import redirectPipe from './src/presets/pipes/process/redirect.pipe.ts';
import {EEvent} from "./src/definition/event.ts";
import RouteEvent from "./src/definition/events/route.event.ts";

const serverConfig: IServerConfig = {
    port: 8080
};
const api = new Api(serverConfig);

// try to use global event stack
addEventListener(EEvent.API_ADD_ROUTE, (event) => {
    if (event instanceof RouteEvent) {
        const { route } = <RouteEvent> event;
        console.log(`Add Route ${route.methods.join(',')} ${route.matcher.uri}`);
    }
});

api
    // add presets
    .addRoute(statusRoute)
    .addRoute(healthzRoute)

    // custom
    .addRoute(
        new Route(EMethod.GET, '/')
            .addPipe(({response}) => {
                response.body = {message: 'Hello API'};
            })
    )
    .addRoute(
        new Route(EMethod.HEAD, '/')
    )

    // redirect example
    .addRoute(
        new Route(EMethod.GET, '/redirect')
            .addPipe(redirectPipe('/redirect-target?name=flex'))
    )
    .addRoute(
        new Route(EMethod.GET, '/redirect-target')
            .addPipe(({response, url}) => {
                response.body = {message: 'Hello API Redirect', name: url.searchParams.get('name') || 'not-set'};
            })
    )

    .addRoute(
        new Route([EMethod.GET, EMethod.POST], '/mixed-hello')
            .addPipe(({response, request}) => {
                response.body = {message: `Hello API by ${request.method}`};
            })
    )

    .addRoute(
        new Route([EMethod.POST], '/body/json')
            .addPipe(jsonBodyPipe)
            .addPipe(({response, state}) => {
                response.body = {
                    message: `Hello API json body`,
                    body: state.get('body'),
                    bodyType: state.get('bodyType')
                };
            })
    )

    .addRoute(
        new Route([EMethod.GET, EMethod.POST], new KeyMatch(
            '/get-by-key-name/:id/:name',
            {
                id: {type: Number},
                name: {}
            }
        ))
            .addPipe(({response, match}) => {
                const {params} = match;
                response.body = {message: `You call with keymatch`, id: params.get('id'), name: params.get('name')};
            })
    )

    // all promisses
    .addRoute(
        new Route(EMethod.GET, '/wait')
            .addPipe(async ({response, state}) => {
                state.set('begin', new Date());
                return new Promise(resolve => {
                    setTimeout(resolve, 1000);
                })
            })
            .addPipe(({response, state}) => {
                response.body = {
                    message: 'Wait a while',
                    begin: state.get('begin'),
                    end: new Date()
                };
            })
    )

    // example with simple json
    .addRoute(
        new Route(EMethod.GET, '/state')
            .addPipe(({response, state}) => {
                const before = new Date();
                response.body = {before};
                state.set('called', before);
            })
            .addPipe(({response, state}) => {
                Object.assign(response.body, {
                    passed: state.get('called'),
                    done: new Date()
                })
            })
    )
    // example with error
    .addRoute(
        new Route(EMethod.GET, '/error')
            .addPipe(() => {
                throw new RequestError('I dont like', 400);
            })
    )


console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();