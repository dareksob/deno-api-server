import { EMethod } from './definition/method.ts';
import { IServerConfig, IResponse } from './definition/types.ts';
import { Api } from './services/api.ts';
import { Route } from './services/route.ts';
import { RequestError } from './errors/request-error.ts';
import mapParamsPipe from './pipes/map-params.pipe.ts';

const serverConfig : IServerConfig = { 
  port: 8080
};
const api = new Api(serverConfig);


api
  // example with simple json
  .addRoute(
    new Route(EMethod.GET, '/test')
      .addPipe(async (route: Route, r: IResponse ) => {
        r.body = { a: 'sd' };
      })
  )

  // example with error
  .addRoute(
    new Route(EMethod.GET, '/bad')
    .addPipe(async (route: Route) => {
      throw new RequestError('I dont like', 400);
    })
  )

  // example with map params pipe
  .addRoute(
    new Route(EMethod.GET, /^\/get\/([0-9])\/([a-z]+)/)
    .addPipe(mapParamsPipe([
      'id',
      'name'
    ]))
    .addPipe(async (route: Route, r: IResponse) => {
      r.body = {
          id: route.params.get('id'),
          name: route.params.get('name')
      }
    })
  )


console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();