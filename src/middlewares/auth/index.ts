import jwt from "jsonwebtoken";
import { IRole, User } from "@/database";
import { StatusCode } from "@/enums";
import type { ParameterizedContext, Next } from "koa";

export async function verifyToken(ctx: ParameterizedContext, next: Next) {
    const token = ctx.header.authorization?.replace("Bearer ", "");

    if (!token) {
        ctx.status = StatusCode.UNAUTHORIZED;
        ctx.body = { error: "Unauthorized" };
        return;
    }

    try {
        const decoded = jwt.verify(token, "TOP_SECRET_KEY");

        ctx.state.user = decoded;

        await next();
    } catch (err) {
        ctx.status = StatusCode.UNAUTHORIZED;
        ctx.body = { error: "Unauthorized" };
    }
}
export const hasRoles = (requiredRoles: Array<string>) => {
    return async (ctx: ParameterizedContext, next: Next): Promise<void> => {
        const user = await User.findOne({ _id: ctx.state.user.id }).populate("roles");

        if (!user) {
            ctx.status = StatusCode.UNAUTHORIZED;
            ctx.body = {
                error: "Unauthorized",
            };
            return;
        }

        const hasRoles = requiredRoles.every((role) => user.roles.some((r) => (r as IRole).name === role));

        if (!hasRoles) {
            ctx.status = StatusCode.UNAUTHORIZED;
            ctx.body = {
                error: "Forbidden",
            };
            return;
        }

        await next();
    };
};
