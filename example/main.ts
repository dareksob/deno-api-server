/**
 * Main example file to see how it works
 */
import {
  Api,
  EMethod,
  EPatternTypes,
  IServerConfig,
  KeyMatch,
  RequestError,
  Route,
  BreakPipe,
} from "../mod.ts";

import statusRoute from "../src/presets/routes/status.ts";
import healthzRoute from "../src/presets/routes/healthz.ts";
import jsonBodyPipe from "../src/presets/pipes/body/json-body.pipe.ts";
import redirectPipe from "../src/presets/pipes/process/redirect.pipe.ts";
import { EEvent } from "../src/definition/event.ts";
import RouteEvent from "../src/definition/events/route.event.ts";
import RequestEvent from "../src/definition/events/request.event.ts";
import filePipe from "../src/presets/pipes/process/file.pipe.ts";
import htmlPipe from "../src/presets/pipes/process/html.pipe.ts";

console.log(`Init deno api server`, Deno.version);

const serverConfig: IServerConfig = { port: 8080 };
const api = new Api(serverConfig);

/**
 * use global event to get information of regist routes
 */
addEventListener(EEvent.API_ADD_ROUTE, (event) => {
  if (event instanceof RouteEvent) {
    const { route } = <RouteEvent> event;
    console.log(`Add Route ${route.methods.join(",")} ${route.matcher.uri}`);
  }
});

// after route response
addEventListener(EEvent.AFTER_ROUTE_RESPONSE, event => {
  if (event instanceof RequestEvent) {
    const { response, request } = <RequestEvent> event;
    console.log(`Response ${response.status} for ${request.url} `);
  }
})

api
  // add preset route for status info
  .addRoute(statusRoute)
  // add preset route for healthcheck, similar to statusRoute but without body
  .addRoute(healthzRoute())
  .addRoute(
    new Route(EMethod.GET, "/public/break.html")
      .addPipe(htmlPipe("<html><body><b>test</b></body></html>")),
  )
  // new url pattern matcher
  .addRoute(
    new Route(
      EMethod.GET,
      new URLPattern({ pathname: '/pattern/:id/:name' })
    )
    .addPipe(ctx => {
      ctx.response.body = {
        msg: 'url pattern',
        id: ctx.match.params.id,
        name: ctx.match.params.name,
        //getId: ctx.match.params.get('id'),
      }
    })
  )
  // more complex file handling
  .addRoute(
    // complex exable for file pipeline
    new Route(
      EMethod.GET,
      new KeyMatch("/process/:file", { file: { type: "rest" } }),
    )
      // example how to break an pipe process
      .addPipe(async (ctx) => {
        const filePath = ctx.match.params.get("file") as string;
        return await filePipe(`/app/example/public/${filePath}`, {
          noThrow: true,
        })(ctx);
      })
      // will return fallback file of not found
      .addPipe(filePipe(`/app/example/not-found.jpg`, { statusCode: 404, contentType: "image/jpg" })),
  )
  // simple example to response hello for get request
  .addRoute(
    new Route(EMethod.GET, "/")
      .addPipe(({ response }) => {
        response.body = { message: "Hello API" };
      }),
  )
  // simple example for 200 on head requests
  .addRoute(
    new Route(EMethod.HEAD, "/"),
  )
  /**
   * use redirect preset to send redirection
   *
   * @preset redirectPipe
   */
  .addRoute(
    new Route(EMethod.GET, "/redirect")
      .addPipe(redirectPipe("/redirect-target?name=flex")),
  )
  // the target route on redirect
  .addRoute(
    new Route(EMethod.GET, "/redirect-target")
      .addPipe(({ response, url }) => {
        response.body = {
          message: "Hello API Redirect",
          name: url.searchParams.get("name") || "not-set",
        };
      }),
  )
  // simple example to mix method on one route
  .addRoute(
    new Route([EMethod.GET, EMethod.POST], "/mixed-hello")
      .addPipe(({ response, request }) => {
        response.body = { message: `Hello API by ${request.method}` };
      }),
  )
  /**
   * simple example integration for json body process
   *
   * @preset jsonBodyPipe
   */
  .addRoute(
    new Route([EMethod.POST], "/body/json")
      .addPipe(jsonBodyPipe)
      .addPipe(({ response, state }) => {
        response.body = {
          message: `Hello API json body`,
          body: state.get("body"), // get json body, created by jsonBodyPipe
          bodyType: state.get("bodyType"), // created on jsonBodyPipe
        };
      }),
  )
  // more complex example to use url params
  .addRoute(
    new Route(
      [EMethod.GET, EMethod.POST],
      // use the key matcher
      new KeyMatch(
        // define params
        "/get-by-key-name/:id/:name",
        // and describe uri params
        {
          id: { type: EPatternTypes.NUMBER }, // you can use 'Number' as string
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
      }),
  )
  // test example for long delay, all pipes support promisses
  .addRoute(
    new Route(EMethod.GET, "/wait")
      .addPipe(async ({ response, state }) => {
        state.set("begin", Date.now());
        return new Promise((resolve) => {
          setTimeout(resolve, 500);
        });
      })
      .addPipe(({ response, state }) => {
        response.body = {
          message: "Wait a while",
          begin: state.get("begin"),
          end: Date.now()
        };
      }),
  )
  /**
   * example to you multi pipes and pass data
   */
  .addRoute(
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
      }),
  )
  // simple example with error, always use request error to safe secure error handling
  .addRoute(
    new Route(EMethod.GET, "/error")
      .addPipe(() => {
        throw new RequestError("I dont like", 400);
      }),
  );

// start listen
console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();
