import Router from "@koa/router";
import { forumsController } from "@/controllers";
import { authMiddleware } from "@/middlewares";
import topicsRouter from "./topics";
import postsRouter from "./posts";

const router = new Router({
    prefix: "/forums",
});

router.use(topicsRouter.routes(), topicsRouter.allowedMethods());
router.use(postsRouter.routes(), postsRouter.allowedMethods());

router.get("/", forumsController.handleGetForums);
router.post("/", authMiddleware.verifyToken, authMiddleware.hasRoles(["admin"]), forumsController.handleCreateForum);
router.get("/:id", forumsController.handleGetForum);
router.get("/:id/topics", forumsController.handleGetForumTopics);
router.post("/:id/topics", authMiddleware.verifyToken, forumsController.handleCreateForumTopic);


export default router;
