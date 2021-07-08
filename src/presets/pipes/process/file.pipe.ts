import {IContext, BreakPipe} from "../../../definition/types.ts";
import {NotFoundError} from "../../../errors/not-found.error.ts";
import {extname} from 'https://deno.land/std@0.100.0/path/mod.ts';
import {Raw} from "../../../services/raw.ts";

const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".zip": "application/zip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/vnd.microsoft.icon",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
};

/**
 * resolve media type by ext
 * @param ext
 */
export function mediaTypeByExt(ext: string): string | undefined {
  return MEDIA_TYPES[ext];
}

/**
 * resolve media type by path
 * @info not detect if file exists
 * @param path
 */
export function mediaTypeByPath(path: string): string | undefined {
  return MEDIA_TYPES[extname(path)];
}

interface IOptions {
  contentType?: string;
  noThrow?: boolean;
  continue?: boolean;
  cacheControl?: string | number | Date;
  statusCode?: number;
}

export default function filePipe(filePath: string, options: IOptions = {}) {
  return async ({ request, response, state } : IContext) => {
    try {
      const [file, fileInfo] = await Promise.all([
        Deno.open(filePath),
        Deno.stat(filePath),
      ]);

      response.body = new Raw(file);
      response.headers.set("Content-Length", fileInfo.size.toString());

      // auto detection of content type if not preset
      const contentType = options.contentType ? options.contentType : mediaTypeByPath(filePath);
      if (contentType) {
        response.headers.set('Content-Type', contentType);
      }

      // option cache control
      if (options.cacheControl) {
        const cc = options.cacheControl;
        let cacheContol = 'public, max-age={x}';
        if (typeof cc === 'string') {
          cacheContol = cc as string;
        }
        else if (typeof cc === 'number') {
          cacheContol = cacheContol.replace('{x}', `${cc}`);
        }
        else {
          cacheContol = cacheContol.replace('{x}', `${cc}`);
        }
        response.headers.set('Cache-Control', cacheContol);
      }

      // set respone status code
      if (options?.statusCode as number > 0) {
        response.status = options.statusCode as number;
      }

      // close file open handler
      request.done.then(() => {
        file.close();
      });

    } catch (error) {
      if (options.noThrow) {
        state.set('fileError', error);
        return;
      }
      throw new NotFoundError(error.message);
    }

    // close pipe process
    if (!options.continue) {
      return BreakPipe;
    }
  }
}