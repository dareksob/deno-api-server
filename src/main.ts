import { EMethod } from './definition/methods.ts';
import { IServerConfig } from './definition/server-config.ts';
import { Api } from './services/api.ts';
import { Route } from './services/route.ts';

const serverConfig : IServerConfig = { 
  port: 8080
};
const api = new Api(serverConfig);

api.addRoute(
  new Route(EMethod.GET, '/test')
    .addPipe(async (route: Route) => {
      
    })
);

await api.listen();