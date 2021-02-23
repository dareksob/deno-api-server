// deno-lint-ignore no-explicit-any

import {EMethod} from './definition/method.ts';
import {IServerConfig} from './definition/types.ts';
import {Api} from './services/api.ts';
import {Route} from './services/route.ts';
import {RequestError} from "./errors/request-error.ts";

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
        new Route(EMethod.GET, '/test-state')
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