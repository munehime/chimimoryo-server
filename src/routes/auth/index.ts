import Router from "@koa/router";
import { authController } from "@/controllers";

const router = new Router({
    prefix: "/auth",
});

router.post("/signin", authController.handleSignin);
router.post("/signup", authController.handleSignup);

export default router;
