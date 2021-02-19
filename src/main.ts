import { EMethod } from './definition/method.ts';
import { IServerConfig, IResponse } from './definition/types.ts';
import { Api } from './services/api.ts';
import { Route } from './services/route.ts';
import { RequestError } from './errors/request-error.ts';

const serverConfig : IServerConfig = { 
  port: 8080
};
const api = new Api(serverConfig);


api
  .addRoute(
    new Route(EMethod.GET, '/test')
      .addPipe(async (route: Route, r: IResponse ) => {
        r.body = { a: 'sd' };
      })
  )
  .addRoute(
    new Route(EMethod.GET, '/bad')
    .addPipe(async (route: Route) => {
      throw new RequestError('I dont like', 400);
    })
  )


console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();