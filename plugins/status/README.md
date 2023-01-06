# deno-api-server healthcheck plugin

Plugin for `deno-api-server` to create a status endpoint quickly


## Integra

```ts
import plugin from 'deno-api-server/plugins/status/plugin.ts';

const api = new Api({}); // deno api server

plugin(api, { body: { name: 'my api' }});

// start server and to to the location and resolve the default endpoint /status
```
