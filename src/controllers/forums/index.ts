import { forumService } from "@/services";
import type { Context } from "koa";
import { parseQueryParam } from "@/utils";

interface CreateForumRequestBody {
    title: string,
    description: string,
    category: string,
}

interface CreateForumTopicRequestBody {
    title: string,
    content: string,
}

interface EditTopicRequestBody {
    title: string,
}

interface EditPostRequestBody {
    content: string,
}

interface ReplyRequestBody {
    content: string,
}

export const handleGetForums = async (ctx: Context): Promise<void> => {
    const skip = Number(parseQueryParam(ctx.query.skip));
    const groupBy = parseQueryParam(ctx.query.group_by);
    
    const { status, data } = await forumService.getForums(skip, groupBy);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleGetForum = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;

    const { status, data } = await forumService.getForum(id);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleCreateForum = async (ctx: Context): Promise<void> => {
    const body = ctx.request.body as CreateForumRequestBody;

    const { status, data } = await forumService.insertForum(body);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleGetForumTopics = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;

    const { status, data } = await forumService.getForumTopics(id);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleCreateForumTopic = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;
    const body = ctx.request.body as CreateForumTopicRequestBody;
    const authorId = ctx.state.user.id;

    const { status, data } = await forumService.insertForumTopic(id, { author_id: authorId, ...body });

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleGetTopicAndPosts = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;

    const { status, data } = await forumService.getTopicAndPosts(id);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleEditTopic = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;
    const body = ctx.request.body as EditTopicRequestBody;
    const userId = ctx.state.user.id;

    const { status, data } = await forumService.updateTopic(id, userId, body.title);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleEditPost = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;
    const body = ctx.request.body as EditPostRequestBody;
    const userId = ctx.state.user.id;

    const { status, data } = await forumService.updatePost(id, userId, body.content);

    ctx.status = status;
    ctx.body = { ...data };
};

export const handleReplyTopic = async (ctx: Context): Promise<void> => {
    const id = ctx.params.id;
    const body = ctx.request.body as ReplyRequestBody;
    const userId = ctx.state.user.id;

    const { status, data } = await forumService.insertPostToTopic(id, userId, body.content);

    ctx.status = status;
    ctx.body = { ...data };
};
