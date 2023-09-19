import Router from "@koa/router";
import api from "./api";
import type { Context } from "koa";

const router = new Router();

router.get("/", handleRoot);

router.use(api.routes(), api.allowedMethods());

function handleRoot(ctx: Context) {
    ctx.body = "hello!";
}

export default router;
