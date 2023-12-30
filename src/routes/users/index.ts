import Router from "@koa/router";
import { usersController } from "@/controllers";
import { authMiddleware } from "@/middlewares";

const router = new Router({
    prefix: "/users",
});

router.get("/", authMiddleware.verifyToken, authMiddleware.hasRoles(["admin"]), usersController.handleGetUsers);
router.get("/me", authMiddleware.verifyToken, usersController.handleGetOwnUser);
router.get("/:id", authMiddleware.verifyToken, authMiddleware.hasRoles(["admin"]), usersController.handleGetUser);

export default router;
