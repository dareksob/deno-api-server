import {IContext} from '../../../definition/types.ts';
import {RequestError} from '../../../errors/request.error.ts';
import rawBodyPipe from './raw-body.pipe.ts';


/**
 * will parse request body to json
 * @info set state bodyType json
 * @info set state body with json payload
 *
 * @param context
 */
export default async function jsonBodyPipe(context : IContext) {
  await rawBodyPipe(context);

  try {
    const {state} = context;
    const jsonBody = JSON.parse(state.get('body'));
    state.set('bodyType', 'json');
    state.set('body', jsonBody);
  } catch (e) {
    throw new RequestError(e.message, 400);
  }
}