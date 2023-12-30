import { userService as userService } from "@/services";
import type { Context } from "koa";

export const handleGetUsers = async (ctx: Context): Promise<void> => {
    const { status, data } = await userService.getMany();

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleGetOwnUser = async (ctx: Context): Promise<void> => {
    const id = ctx.state.user.id;
    
    const { status, data } = await userService.getOne(id);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleGetUser = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;

    const { status, data } = await userService.getOne(id);

    ctx.status = status;
    ctx.body = { ...data };
};
