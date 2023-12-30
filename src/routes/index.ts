import Router from "@koa/router";
import authRouter from "./auth";
import usersRouter from "./users";
import forumsRouter from "./forums";
import type { ParameterizedContext } from "koa";

const router = new Router();

router.get("/", handleRoot);

router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(usersRouter.routes(), usersRouter.allowedMethods());
router.use(forumsRouter.routes(), forumsRouter.allowedMethods());

function handleRoot(ctx: ParameterizedContext) {
    ctx.body = "hello!";
}

export default router;
