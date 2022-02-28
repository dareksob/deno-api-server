# deno-api-server

An http/rest api server for deno. Based on std deno http library and use the
concept of functional programming for your endpoint definitions.

- [API Documentation](https://doc.deno.land/https/deno.land/x/deno_api_server/mod.ts)
- [Preset API Documentation](https://doc.deno.land/https/deno.land/x/deno_api_server/src/presets/mod.ts)
- [Testing API Documentation](https://doc.deno.land/https/deno.land/x/deno_api_server/dev_mod.ts)
- [Release notes](./RELEASE_NOTES.md)

## Basic functionality example

```typescript
import {
  Api,
  EMethod,
  Route,
} from "https://deno.land/x/deno_api_server/mod.ts";

const api = new Api({ port: 8080 });

api.addRoute(
  new Route(EMethod.GET, "/")
    .addPipe(({ response }) => {
      response.body = { message: "Hello API" };
    }),
);

console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();
```

## events

`API_ADD_ROUTE` (RouteEvent) will trigger before a new route append to api
stack. Tip use this as injection hook for your services

`BEFORE_ROUTE` (RouteEvent) will trigger before execute the current route

`BEFORE_REQUEST` (RequestEvent) will trigger before a route are detected and
before it execute

`ROUTE_NOT_FOUND` (RequestEvent) will trigger if route not match [404]

## More code examples

### Add simple route to your api

```typescript
/** INFO: don't forget route to your Api, see first example **/
new Route(EMethod.GET, '/say-hello')
    .addPipe(({response}) => {
        response.body = {message: 'Hello API'};
    })
)
```

### Add simple route with multi methods

```typescript
/** INFO: don't forget route to your Api, see first example **/
new Route([EMethod.GET, EMethod.POST], "/say-hello")
  .addPipe(({ response, request }) => {
    response.body = { message: `Hello API by ${request.method}` };
  });
```

### Use state to pass data between pipes

```typescript
/** INFO: don't forget route to your Api, see first example **/
new Route(EMethod.GET, "/state")
  .addPipe(({ response, state }) => {
    const before = new Date();
    response.body = { before };
    state.set("called", before);
  })
  .addPipe(({ response, state }) => {
    Object.assign(response.body, {
      passed: state.get("called"),
      done: new Date(),
    });
  });
```

### Throw error to handle by api

```typescript
/** INFO: don't forget route to your Api, see first example **/
new Route(EMethod.GET, "/error")
  .addPipe(() => {
    throw new RequestError("I dont like", 400);
  });
```

### Key mapped uri with KeyMatch for url params

```typescript
new Route(
  EMethod.GET,
  new KeyMatch(
    "/get-by-key-name/:id/:name",
    {
      id: { type: "number" },
      name: {},
    },
  ),
)
  .addPipe(({ response, match }) => {
    const { params } = match;
    response.body = {
      message: `You call with keymatch`,
      id: params.get("id"),
      name: params.get("name"),
    };
  });
```

For more details about KeyMatch see API Documentation KeyMatch

# API Dokumentation

### class Api

Core server class, create an instance for your own api

Similar configuration of deno http service

```
new Api(config: IServerConfig)
```

Add new Routes / Entpoints

```
api.addRoute(route: IRoute)
```

Start server to listen

```
api.listen();
```

### class Route

Core route or entpoint defintion for your api.

```
new Route(method: string[] | string, uri : IMatcher | string)
```

Add route pipeline

```
route.addPipe(pipe: IPipe) : Route
```

Example: Add a stack of pipes

```
route
    .addPipe((context: IContext) => { ... })
    .addPipe(async (context: IContext) => { ... })
```

`Tip` use deconstruction for select context props

Execute a route pipeline, this will be called by api if route match with uri
defintion

```
route.execute(url: URL, request: ServerRequest, response: IResponse): Promise<IContext>
```

## Matcher

### class UriMatch

Base endpoint matcher for simple definition of uris.

`INFO` you can use a string for Route definition, the Route will create a simple
UriMatch

## class KeyMatch

More complex uri definition for your route with transpile your parameters. A
KeyMatch can use a transform function to change the type of value

```
new KeyMatch(uri: string, describe: IKeyDescribes)
```

Examples:

```
new KeyMatch('/get/:id', { id: {} }) => match: /get/1, params: { id: '1' }
new KeyMatch('/get/:id', { id: {} }) => match: /get/hello-my, params: { id: 'hello-my' }

// with transpile type
new KeyMatch('/get/:id', { id: { type: 'number' } }) => match: /get/1, params: { id: 1 }
new KeyMatch('/get/:id', { id: { type: 'number' } }) => not match: /get/hello

// with rest type
new KeyMatch('/get/:path', { path: { type: 'rest' } }) => match /get/super-dup/megaman, params: { path: 'super-dup/megaman' }
```

### IKeyDescribe.type

A list of `EPatternTypes`

- `Any` for any parameter like string, number and combination
- `Number` for float and numbers
- `Int` for integer numbers
- `Alpha` for alphabetic values
- `Hash` for hash values
- `Rest` for rest of the url path

### Custom methode to define a custom param pattern

Use Property `describe` to define a `IPatternDescribe`

Example:

```js
new KeyMatch('/get/:p', { 
  p: {
    describe: {
      pattern: '(a-z){1}',
      transform: (v: string) => v.toUpperCase()
    }
  }
}) => will match /get/g, params: { p: 'G' }
```

## Quick test api server

```typescript
import "https://deno.land/x/deno_api_server@v0.0.2/example.ts";
/**
 * will start server on localhost:8080
 * try all entpoints on example
 **/
```

All presets defined in `src/presets`

## List of presets

[Preset API Documentation](https://doc.deno.land/https/deno.land/x/deno_api_server/src/presets/mod.ts)

All presets defined in `src/presets`

### Route presets `src/presets/routes/*`

- `healthz` GET|HEAD /healthz for healthcheck
- `status` GET /status similar to healthcheck but customizable definitions, see
  API DOC

### Pipes presets `src/presets/pipes/*`

#### `body/raw-body.pipe.ts`

Read body data of request.

Set state `body` with string data Set state `bodyType` with the type of data ==
raw

```typescript
import rawBodyPipe from "https://deno.land/x/deno_api_server/src/presets/pipes/body/raw-body.pipe.ts";
route
  .addPipe(rawBodyPipe)
  .addPipe(({ state }: IContext) => {
    const anyBody = state.get("body");
  });
```

#### `body/json-body.pipe.ts`

Try to parse json data of request body. Otherwise throw 400 error.

Set state `body` with json data Set state `bodyType` with the type of data ==
json

```typescript
import jsonBodyPipe from "https://deno.land/x/deno_api_server/src/presets/pipes/body/json-body.pipe.ts";
route
  .addPipe(jsonBodyPipe)
  .addPipe(({ state }: IContext) => {
    const validJsonBody = state.get("body");
  });
```

#### `process/redirect.pipe.ts`

Redirect pipe with default 302 redirection to your url. Basic implementation to
redirect your route.

```typescript
import redirectPipe from "https://deno.land/x/deno_api_server/src/presets/pipes/process/redirect.pipe.ts";
route
  .addPipe(redirectPipe("/other-page"));
```

If you want to redirect a dynamic page use any capsule pipe function, like here

```typescript
import redirectPipe from "https://deno.land/x/deno_api_server/src/presets/pipes/process/redirect.pipe.ts";
route
  .addPipe((context: IContext) => {
    const url = `/test-to-my?set=1`;
    return redirectPipe(url)(context);
  });
```

## Testing

Use buildin mocks to create a api request.

[Build-In](https://deno.land/x/deno_api_server/dev_mod.ts)
[API Documentation](https://doc.deno.land/https/deno.land/x/deno_api_server/dev_mod.ts)

A simple example

```typescript
import { mockApi } from "https://deno.land/x/deno_api_server/dev_mod.ts";

Deno.test("Example mockApi route success request", async () => {
  const route = new Route("GET", "/hello");

  // create api
  const api = mockApi(route);

  await api.sendByArguments("GET", "/hello");

  assertEquals(api.lastRoute === route, true);
  assertEquals(api?.lastContext?.response.status, 200);
});
```

A payload example

```typescript
import {
  mockApi,
  mockRequest,
} from "https://deno.land/x/deno_api_server/dev_mod.ts";

Deno.test("Example mockApi post request with request data", async () => {
  const route = new Route("POST", "/submit");
  route
    .addPipe(jsonBodyPipe)
    .addPipe(({ state, response }) => {
      response.status = 201;
      response.body = state.get("body");
    });

  const api = mockApi(route);

  const request = mockRequest("POST", "/submit", {
    name: "super",
  });
  await api.sendByRequest(request);

  assertEquals(api.lastRoute === route, true);
  assertEquals(api?.lastContext?.response.status, 201);
  assertEquals(api?.lastContext?.response.body, { name: "super" });
});
```

More examples in `example/unit-testing.test.ts`

## Best Practice

Tips and best practice to use this server.

- Write custom and small pipes to reuse
- create a custom createRoute function to setup your app or use events to inject
  services
- use Route.di / Route.injections to share services and other stuff
- create factory functions for injections, like getConnection factory to connect
  to database only if route will execute
- write test by mock your injections (like mock service for your database
  connection)
- use state to pass data between your pipes

## examples

See `example` folder for more use case examples.

#### `example/unit-testing.test.ts`

route and api testing example and how to use build-in mock functions.

### Third party examples are

#### example/body-validation.ts

Use validasaur to validate your json body
[validasaur deno.land](https://deno.land/x/validasaur)

#### example/authentification-jwt.ts

Use djwt to handle and secure your endpoints, a very simple example to customize
your process [validasaur deno.land](https://deno.land/x/djwt)

## links

[deno](https://deno.land)

# deno-api-server-swagger-plugin
