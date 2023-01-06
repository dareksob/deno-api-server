# deno-api-server healthcheck plugin

Plugin for `deno-api-server` to create a status endpoint quickly


## Integra

```ts
import plugin from 'deno-api-server/plugins/healthcheck/plugin.ts';

const api = new Api({}); // deno api server

plugin(api);

// start server and to to the location and resolve the default endpoint /healthz
```
