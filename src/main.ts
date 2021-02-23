// deno-lint-ignore no-explicit-any
import {EMethod, IServerConfig, Api, Route, RequestError, KeyMatch } from '../mod.ts';

const serverConfig: IServerConfig = {
    port: 8080
};
const api = new Api(serverConfig);

api
    .addRoute(
        new Route(EMethod.GET, '/')
            .addPipe(({response}) => {
                response.body = {message: 'Hello API'};
            })
    )
    .addRoute(
        new Route(EMethod.HEAD, '/')
    )

    .addRoute(
        new Route([EMethod.GET, EMethod.POST], '/mixed-hello')
            .addPipe(({response, request}) => {
                response.body = { message: `Hello API by ${request.method}` };
            })
    )

    .addRoute(
        new Route([EMethod.GET, EMethod.POST], new KeyMatch(
            '/get-by-key-name/:id/:name',
            {
                id: { type: Number },
                name: {}
            }
        ))
            .addPipe(({response, match}) => {
                const { params } = match;
                response.body = { message: `You call with keymatch`, id: params.get('id'), name: params.get('name') };
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
            .addPipe( ({response, state}) => {
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