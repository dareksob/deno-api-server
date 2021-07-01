/**
 * example how your can serve static files for deno api server
 */
import {EMethod, IServerConfig, Api, Route, KeyMatch} from '../mod.ts';
import filePipe from "../src/presets/pipes/process/file.pipe.ts";

const serverConfig: IServerConfig = {port: 8080};
const api = new Api(serverConfig);

api
  .addRoute(
    new Route(EMethod.GET, new KeyMatch('/public/:file', {file: {type: 'rest'}}))
      .addPipe(async (ctx) => {
        const filePath = ctx.match.params.get('file') as string;
        return await filePipe(`/app/example/public/${filePath}`)(ctx);
      })
  )

  .addRoute(
    // complex exable for file pipeline
    new Route(EMethod.GET, new KeyMatch('/process/:file', {file: {type: 'rest'}}))
      // example how to break an pipe process
      .addPipe(async (ctx) => {
        const filePath = ctx.match.params.get('file') as string;
        return await filePipe(`/app/example/public/${filePath}`, { noThrow: true })(ctx);
      })
      // only example you get file error inside state
      .addPipe(({ state }) => {
        console.log(state.get('fileError')); // information about last pipe
      })
      // will return fallback file of not found
      .addPipe(
        filePipe(`/app/example/not-found.jpg`, { contentType: 'image/jpg' })
      )
  )


// start listen
console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();