import Router from "@koa/router";
import { forumsController } from "@/controllers";
import { authMiddleware } from "@/middlewares";

const router = new Router({
    prefix: "/topics",
});

router.get("/:id", forumsController.handleGetTopicAndPosts);
router.patch("/:id", authMiddleware.verifyToken, forumsController.handleEditTopic);
router.post("/:id/reply", authMiddleware.verifyToken, forumsController.handleReplyTopic);

export default router;
