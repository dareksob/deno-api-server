import {assertEquals, assertMatch} from '../../../dev_deps.ts';
import {mockContext} from '../../../testing/mock-context.ts';
import {default as filePipe, mediaTypeByExt, mediaTypeByPath} from './file.pipe.ts';
import {BreakPipe} from "../../../definition/types.ts";
import {Raw} from "../../../services/raw.ts";

const fixturePath = await Deno.realPath('./example/public');

Deno.test('mediaTypeByExt should return type by extention', () => {
  assertEquals(typeof mediaTypeByExt, 'function');
  assertEquals(mediaTypeByExt('.jpg'), 'image/jpeg');
  assertEquals(mediaTypeByExt('.pdf'), 'application/pdf');
});

Deno.test('mediaTypeByPath should return type by file path', () => {
  assertEquals(typeof mediaTypeByPath, 'function');
  assertEquals(mediaTypeByPath(`${fixturePath}/any.png`), 'image/png');
});

Deno.test('filePipe should response file', async () => {
  const ctx = mockContext();
  const filePath = `${fixturePath}/image.png`;

  assertEquals(typeof filePipe, 'function');

  assertEquals(ctx.response.status, 200);
  assertEquals(ctx.response.headers.has('Cache-Control'), false);

  const pipe = filePipe(filePath, { cacheControl: 100, statusCode: 401 });
  const returnValue = await pipe(ctx);

  assertEquals(ctx.response.status, 401);
  assertEquals(ctx.response.headers.has('Cache-Control'), true, 'Not cache control set');
  assertEquals(ctx.response.headers.get('Cache-Control'), 'public, max-age=100');

  assertEquals(ctx.response.body instanceof Raw, true, 'Body should be a Raw class');
  assertEquals(ctx.response.body.body instanceof Deno.File, true, 'Raw body should be an file');

  assertEquals(returnValue, BreakPipe);

  // close file connection
  ctx.response.body.body.close();
});

Deno.test('filePipe should catch exceptions', async () => {
  const ctx = mockContext();
  const filePath = `${fixturePath}/i_dont_exists.png`;

  const pipe = filePipe(filePath, { noThrow: true });
  const returnValue = await pipe(ctx);

  assertEquals(returnValue, undefined);
  assertEquals(ctx.state.has('fileError'), true);
  assertMatch(ctx.state.get('fileError').message, /No such file or directory/);
});

Deno.test('filePipe contine the pipe process', async () => {
  const ctx = mockContext();
  const filePath = `${fixturePath}/image.png`;

  const pipe = filePipe(filePath, { continue: true });
  const returnValue = await pipe(ctx);
  assertEquals(returnValue, undefined);

  // close file connection
  ctx.response.body.body.close();
});