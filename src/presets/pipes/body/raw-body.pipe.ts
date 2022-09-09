import { IContext } from "../../../definition/types.ts";
/**
 * will parse request body to raw test
 * @info set state bodyType raw
 * @info set state body with decoded value
 *
 * @param context
 */
export default async function rawBodyPipe({ request, state }: IContext) {
  state.set("body", request.bodyUsed ? await request.text() : '');
  state.set("bodyType", "raw");
}
