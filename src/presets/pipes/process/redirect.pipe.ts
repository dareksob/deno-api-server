import { BreakPipe, IContext, IPipe } from "../../../definition/types.ts";

export default function redirectPipe(
  url: string | URL,
  status: number = 302,
  referrer?: string | URL,
): IPipe {
  return ({ response }: IContext) => {
    response.headers.set("Location", `${url}`);

    if (referrer) {
      response.headers.set("Referrer", `${referrer}`);
    }

    response.status = status;

    return BreakPipe;
  };
}
