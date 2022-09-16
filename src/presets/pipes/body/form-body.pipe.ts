import { BadRequestError, IContext } from "../deps.ts";
import { Form, multiParser } from "https://deno.land/x/multiparser@v0.114.0/mod.ts";

export type { FormFile, Form } from "https://deno.land/x/multiparser@v0.114.0/mod.ts";

interface IConfig {
    stateKey?: string
    errorMessage?: string
}

export const STATE_KEY = 'body';

/**
 * @example route
 *  .addPipe(formBodyPipe())
 *  // get the body
 *  .addPipe(ctx => ctx.state.get(STATE_KEY))
 */
export default function formBodyPipe(config: IConfig) {
    return async (ctx: IContext) => {
        const formData = await multiParser(ctx.request) as Form;
        if (!formData) {
            throw new BadRequestError(
                config.errorMessage ?? 'Invalid form data'
            );
        }
        ctx.state.set(config.stateKey ?? STATE_KEY, formData);
    }
}