/**
 * example to integrate Third party library to auth by json web token
 * @obsolate please use on new version of deno the global Crypto API
 * @see https://deno.land/x/djwt
 */
import { AccessDeniedError, Api, EMethod, IContext, Route } from "../mod.ts";

// create an api instance
const api = new Api({ port: 8080 });

// import some inbuild routes and pipes
import statusRoute from "../src/presets/routes/status.ts";
import jsonBodyPipe from "../src/presets/pipes/body/json-body.pipe.ts";

// add status endpoint
api.addRoute(statusRoute);

import { create, verify } from "https://deno.land/x/djwt/mod.ts";

const HEADER_KEY = "token";
const STATE_KEY = "auth";
const SECRET = "DENOAPI20";

/**
 * create custom verify token
 */
async function verifyPipe({ request, state }: IContext) {
  if (request.headers.has(HEADER_KEY)) {
    try {
      const jwt = <string> request.headers.get(HEADER_KEY);
      const payload = await verify(jwt, SECRET, "HS512");
      state.set(STATE_KEY, payload);
    } catch (e) {
      throw new AccessDeniedError(e.message, 403, e);
    }
  }
  // maybe you throw an error if header and token not valid
}

// to secure other endpointy by detect right
function hasRightPipe(name: string) {
  return ({ request, state }: IContext) => {
    if (state.has(STATE_KEY)) {
      const auth = state.get(STATE_KEY);
      if (auth && Array.isArray(auth.rights)) {
        if (auth.rights.includes(name)) {
          return; // continue
        }
      }
    }

    throw new AccessDeniedError();
  };
}

////// add routes

api
  // add example to create jwt
  .addRoute(
    new Route(EMethod.GET, "/auth")
      .addPipe(async ({ response }) => {
        const authModel = {
          name: "api-server",
          rights: ["test"],
        };
        // tip use expire token for more secure
        const token = await create(
          { alg: "HS512", typ: "JWT" },
          authModel,
          SECRET,
        );

        response.body = { token };
      }),
  )
  // add example to create jwt
  .addRoute(
    new Route(EMethod.GET, "/safe")
      // deconstruct jwt if possible
      .addPipe(verifyPipe)
      // save by rights
      .addPipe(hasRightPipe("test"))
      // success
      .addPipe(async ({ response, state }) => {
        response.body = {
          message: "safe",
          authData: state.get(STATE_KEY),
        };
      }),
  );

// start server
console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();

/**
 try it

 to get an token
 curl --location --request GET 'http://localhost:8080/auth' \
 --header 'Content-Type: application/json' \
 --data-raw '{
    "name": "deno"
}'

 curl --location --request GET 'http://localhost:8080/safe' \
 --header 'token: eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYXBpLXNlcnZlciIsInJpZ2h0cyI6WyJ0ZXN0Il19.rQu0bx4gFE1aLOhfdC8kcGxNlWeE9x0xbJ89XdmxXg5LsQO1deFKfS4x5okbyPXJz_o3ujD1KwI9D84ikxqdCQ'

*/
