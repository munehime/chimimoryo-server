import Router from "@koa/router";
import type { Context } from "koa";

const router = new Router({
    prefix: "/api",
});

router.get("/", handleRoot);

function handleRoot(ctx: Context) {
    ctx.body = "hello from api!";
}

export default router;
