import { IContext } from "../../../definition/types.ts";
import { RequestError } from "../../../errors/request.error.ts";

/**
 * will parse request body to json
 * @info set state bodyType json
 * @info set state body with json payload
 *
 * @param context
 */
export default async function jsonBodyPipe({ state, request }: IContext) {
  try {
    state.set("bodyType", "json");
    state.set("body", await request.json());
  } catch (e) {
    throw new RequestError(e.message, 400);
  }
}
