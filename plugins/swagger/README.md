# deno-api-server swagger plugin
Plugin for `deno-api-server` to create a swagger json definition endpoint.

Status `WIP`

## Integration
`/swagger.json` to get the swagger format file

````ts
const api = new Api({}); // deno api server
// add routes or other stuff

const route = new Route(EMethod.GET, '/test')
  // add swagger route details as prop
  .prop('swagger', {
    tags: ['bunny'],
    summary: 'you get some data'
  });

// init swagger plugin
await swaggerPlugin(api, {
  info: {
    title: 'my api',
    description: 'my api for your'
  }
});

// start server and to to the location and resolve the default endpoint /swagger.json

````

See [deno](https://deno-land) or [source readme](src/README.md) readme for more details.