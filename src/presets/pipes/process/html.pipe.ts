import { BreakPipe, IContext } from "../../../definition/types.ts";

export default function htmlPipe(html: string) {
  return (ctx: IContext) => {
    ctx.response.headers.set("Content-Type", "text/html; charset=utf-8");
    ctx.response.body = html;
    return BreakPipe;
  };
}
