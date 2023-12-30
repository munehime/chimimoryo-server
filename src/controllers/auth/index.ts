import { authService } from "@/services";
import type { ParameterizedContext } from "koa";

interface SigninRequestBody {
    username: string;
    email: string;
    password: string;
}

interface SignupRequestBody {
    username: string;
    email: string;
    password: string;
}

export const handleSignin = async (ctx: ParameterizedContext): Promise<void> => {
    const userData = ctx.request.body as SigninRequestBody;

    const { status, data } = await authService.signin(userData);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleSignup = async (ctx: ParameterizedContext): Promise<void> => {
    const userData = ctx.request.body as SignupRequestBody;
    
    const { status, data } = await authService.signup(userData);

    ctx.status = status;
    ctx.body = { ...data };
};
