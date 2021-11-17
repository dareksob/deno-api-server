import { IContext } from "../../../definition/types.ts";

// internal decoder
const decoder = new TextDecoder();

/**
 * will parse request body to raw
 * @info set state bodyType raw
 * @info set state body with decoded value
 *
 * @param context
 */
export default async function rawBodyPipe({ request, state }: IContext) {
  const body = await Deno.readAll(request.body);
  const rawBody = decoder.decode(body);

  state.set("body", rawBody);
  state.set("bodyType", "raw");
}
