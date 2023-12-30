import Router from "@koa/router";
import { forumsController } from "@/controllers";
import { authMiddleware } from "@/middlewares";

const router = new Router({
    prefix: "/posts",
});

router.patch("/:id", authMiddleware.verifyToken, forumsController.handleEditPost);

export default router;
