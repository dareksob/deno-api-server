# deno-api-server access-log plugin

Plugin for `deno-api-server` to log all access of api


## Integra

```ts
import plugin from 'deno-api-server/plugins/access-log/plugin.ts';

const api = new Api({}); // deno api server

plugin(api, { log: console.log });

// start server and to to the location call any valid endpoint
```
