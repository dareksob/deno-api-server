# deno-api-server
An http/rest api server for deno. Based on std http library of deno and use the concept of functional programming for your endpoint definitions.

`Status` WIP

Project WIP, please wait for the first release ;-)


## Basic functionality example

````typescript
import { Api, Route, EMethod } from "https://deno.land/x/deno-api-server/src/mod.ts";

const api = new Api({ port: 8080 });

api.addRoute(
        new Route(EMethod.GET, '/')
            .addPipe(({response}) => {
                response.body = {message: 'Hello API'};
            })
    )

console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();
````


### Add simple route to your api
```typescript
import { Route, EMethod } from "https://deno.land/x/deno-api-server/src/mod.ts";

/** INFO: don't forget route to your Api, see first example **/
new Route(EMethod.GET, '/say-hello')
    .addPipe(({response}) => {
        response.body = {message: 'Hello API'};
    })
)
```

### Add simple route with multi methods
```typescript
import { Route, EMethod } from "https://deno.land/x/deno-api-server/src/mod.ts";

/** INFO: don't forget route to your Api, see first example **/
new Route([EMethod.GET, EMethod.POST], '/say-hello')
    .addPipe(({response, request}) => {
        response.body = { message: `Hello API by ${request.method}` };
    });
```

### Use state to pass data between pipes
```typescript
import { Route, EMethod } from "https://deno.land/x/deno-api-server/src/mod.ts";

/** INFO: don't forget route to your Api, see first example **/
new Route(EMethod.GET, '/state')
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
    });
```

### Throw error to handle by api
```typescript
import { Route, EMethod } from "https://deno.land/x/deno-api-server/src/mod.ts";

/** INFO: don't forget route to your Api, see first example **/
new Route(EMethod.GET, '/error')
    .addPipe(() => {
        throw new RequestError('I dont like', 400);
    })
```

### Key mapped uri with KeyMatch for url params
````typescript
new Route(
    EMethod.GET, 
    new KeyMatch(
        '/get-by-key-name/:id/:name',
        {
            id: { type: Number },
            name: {}
        }
    )
)
    .addPipe(({response, match}) => {
        const { params } = match;
        response.body = { message: `You call with keymatch`, id: params.get('id'), name: params.get('name') };
    })
````
For more details about KeyMatch see API Documentation KeyMatch


# API Dokumentation

### class Api
Core server class, create an instance for your own api

Similar configuration of deno http service
````
new Api(config: IServerConfig)
````

Add new Routes / Entpoints
````
api.addRoute(route: IRoute)
````

Start server to listen
````
api.listen();
````


### class Route
Core route or entpoint defintion for your api.

````
new Route(method: string[] | string, uri : IMatcher | string)
````

Add route pipeline
````
route.addPipe(pipe: IPipe) : Route
````

Example: Add a stack of pipes
````
route
    .addPipe((context: IContext) => { ... })
    .addPipe(async (context: IContext) => { ... })
````

`Tip` use deconstruction for select context props

Execute a route pipeline, this will be called by api if route match with uri defintion
```
route.execute(url: URL, request: ServerRequest, response: IResponse): Promise<IContext>
```

## Matcher

### class UriMatch
Base endpoint matcher for simple definition of uris.

`INFO` you can use a string for Route definition, the Route will create a simple UriMatch

## class KeyMatch
More complex uri definition for your route with transpile your parameters.
A KeyMatch can use a transform function to change the type of value

```
new KeyMatch(uri: string, describe: IKeyDescribes)
```

Examples: 
````
new KeyMatch('/get/:id', { id: {} }) => match: /get/1, params: { id: '1' }
new KeyMatch('/get/:id', { id: {} }) => match: /get/hello-my, params: { id: 'hello-my' }

// with transpile type
new KeyMatch('/get/:id', { id: { type: Number } }) => match: /get/1, params: { id: 1 }
new KeyMatch('/get/:id', { id: { type: Number } }) => not match: /get/hello
````

### IKeyDescribe.type
- `'Any'` for any parameter like string, number and combination
- `Number` for float and numbers
- `'Int'` for integer numbers 

## links

[deno](https://deno.land)
