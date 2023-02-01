# deno-api-server add-route plugin

Plugin for `deno-api-server` to log all routes that added to the api (only on start)


## Integration

```ts
import plugin from 'deno-api-server/plugins/add-route/plugin.ts';

const api = new Api({}); // deno api server

plugin(api, { log: console.log });

// add routes like
api.addRoute(new Route('GET', '/test'));

// start server
```
