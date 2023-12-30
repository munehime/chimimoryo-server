import logger from "@/logger";
import { StatusCode } from "@/enums";
import { Counter, Forum, ForumInfo, Post, PostInfo, Topic, TopicInfo } from "@/database";
import { isNumeric, groupByKey } from "@/utils";
import { findUserById } from "../user";

interface NewForumData {
    title: string,
    description: string,
    category: string,
}

interface NewTopicData {
    author_id: string | number,
    title: string,
    content: string,
}

export const getForums = async (
    skip?: number,
    groupBy?: string,
): Promise<{
    status: StatusCode;
    data: {
        forums?: Array<ForumInfo | any>;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const forums = await Forum.find({}, {}, { skip: skip ?? 0, limit: 50 });
        const forumsInfo = await Promise.all(forums.map(async (forum) => await forum.getInfo({ populatePost: true })));

        if (groupBy === "category") {
            const groupedForums = groupByKey(forumsInfo, "category");
            const forumsArray = Object.keys(groupedForums)
                .map((category) => {
                    return {
                        category: category,
                        forums: groupedForums[category],
                    };
                });

            return {
                status: StatusCode.OK,
                data: { forums: forumsArray },
            };
        }

        return {
            status: StatusCode.OK,
            data: { forums: forumsInfo },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const getForum = async (
    id: string | number,
): Promise<{
    status: StatusCode;
    data: {
        forum?: ForumInfo;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const forum = await findForumById(id);

        if (!forum) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No forum found",
                },
            };
        }

        return {
            status: StatusCode.OK,
            data: { forum: await forum.getInfo({ populatePosts: true }) },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const insertForum = async (
    forumData: NewForumData,
): Promise<{
    status: StatusCode;
    data: {
        message?: string;
        error?: string;
    };
}> => {
    try {
        let counter = await Counter.findOneAndUpdate({ coll: "forums" }, { $inc: { seq: 1 } }, { new: true });

        if (!counter) {
            counter = await Counter.create({
                coll: "forums",
                seq: 1,
            });
        }

        await Forum.create({
            forum_id: counter.seq,
            title: forumData.title,
            description: forumData.description,
            category: forumData.category,
        });

        return {
            status: StatusCode.OK,
            data: { message: "Added forum to database" },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const getForumTopics = async (
    id: string | number,
): Promise<{
    status: StatusCode;
    data: {
        topics?: Array<TopicInfo>;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const forum = await findForumById(id);

        if (!forum) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No forum found",
                },
            };
        }

        const topics = await Topic.find({ forum: forum });
        const topicsInfo = (await Promise.all(topics.map(async (topic: any) => await topic.getInfo({
            populateForum: true,
            populateAuthor: true,
            populatePost: true,
        })))).sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return {
            status: StatusCode.OK,
            data: { topics: topicsInfo },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const insertForumTopic = async (
    forumId: string | number,
    topicData: NewTopicData,
): Promise<{
    status: StatusCode;
    data: {
        message?: string;
        error?: string;
    };
}> => {
    try {
        const forum = await findForumById(forumId);

        if (!forum) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No forum found",
                },
            };
        }

        const author = await findUserById(topicData.author_id);

        let counter = await Counter.findOneAndUpdate({ coll: "topics" }, { $inc: { seq: 1 } }, { new: true });

        if (!counter) {
            counter = await Counter.create({
                coll: "topics",
                seq: 1,
            });
        }

        const topic = await Topic.create({
            topic_id: counter.seq,
            forum: forum,
            title: topicData.title,
            author: author,
        });

        counter = await Counter.findOneAndUpdate({ coll: "posts" }, { $inc: { seq: 1 } }, { new: true });

        if (!counter) {
            counter = await Counter.create({
                coll: "posts",
                seq: 1,
            });
        }

        const post = await Post.create({
            post_id: counter.seq,
            forum: forum,
            topic: topic,
            author: author,
            content: topicData.content,
        });

        topic.first_post = post;
        topic.last_post = post;
        topic.post_count ++;

        forum.latest_post = post;

        await Promise.all([
            topic.save(),
            forum.save(),
        ]);

        return {
            status: StatusCode.OK,
            data: { message: "Added topic to forum" },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const getTopicAndPosts = async (
    id: string | number,
): Promise<{
    status: StatusCode;
    data: {
        topic?: TopicInfo;
        posts?: Array<PostInfo>;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const topic = await findTopicById(id);

        if (!topic) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No topic found",
                },
            };
        }

        const posts = await Post.find({ topic: topic });
        const postsInfo = await Promise.all(posts.map((post) => post.getInfo({
            populateForum: true,
            populateTopic: true,
            populateAuthor: true,
        })));

        topic.view_count ++;

        await topic.save();

        return {
            status: StatusCode.OK,
            data: { topic: await topic.getInfo(), posts: postsInfo },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const updateTopic = async (
    id: string | number,
    userId: string | number,
    title: string,
): Promise<{
    status: StatusCode;
    data: {
        message?: string;
        error?: string;
    };
}> => {
    try {
        const topic = await findTopicById(id);

        if (!topic) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No topic found",
                },
            };
        }

        const user = await findUserById(userId);

        if (!user._id.equals(topic.author)) {
            return {
                status: StatusCode.FORBIDDEN,
                data: {
                    error: "You cannot edit other users topic",
                },
            };
        }

        topic.title = title;
        topic.updated_at = Date.now();

        await topic.save();

        return {
            status: StatusCode.OK,
            data: { message: "Updated topic title" },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const updatePost = async (
    id: string | number,
    userId: string | number,
    content: string,
): Promise<{
    status: StatusCode;
    data: {
        message?: string;
        error?: string;
    };
}> => {
    try {
        const post = await findPostById(id);

        if (!post) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No post found",
                },
            };
        }

        const user = await findUserById(userId);

        if (!user._id.equals(post.author)) {
            return {
                status: StatusCode.FORBIDDEN,
                data: {
                    error: "You cannot edit other users post",
                },
            };
        }

        post.content = content;
        post.updated_at = Date.now();

        await post.save();

        return {
            status: StatusCode.OK,
            data: { message: "Updated post content" },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export const insertPostToTopic = async (
    id: string | number,
    userId: string | number,
    content: string,
): Promise<{
    status: StatusCode;
    data: {
        message?: string;
        error?: string;
    };
}> => {
    try {
        const post = await findPostById(id);

        if (!post) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No post found",
                },
            };
        }

        let counter = await Counter.findOneAndUpdate({ coll: "posts" }, { $inc: { seq: 1 } }, { new: true });

        if (!counter) {
            counter = await Counter.create({
                coll: "posts",
                seq: 1,
            });
        }

        const topic = await findTopicById(post.topic);
        const forum = await findForumById(post.forum);
        const author = await findUserById(userId);

        const newPost = await Post.create({
            post_id: counter.seq,
            forum: post.forum,
            topic: post.topic,
            author: author,
            content: content,
        });

        topic.last_post = newPost;
        topic.post_count ++;
        topic.updated_at = Date.now();

        forum.latest_post = newPost;

        await Promise.all([
            topic.save(),
            forum.save(),
        ]);

        await topic.save();

        return {
            status: StatusCode.OK,
            data: { message: "Replied to post" },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: "Internal Server Error",
            },
        };
    }
};

export async function findForumById(id: string | number, populate?: { path: string }): Promise<any> {
    if (!isNumeric(id)) {
        if (populate) {
            return Forum.findOne({ _id: id }).populate(populate);
        }

        return Forum.findOne({ _id: id });
    }

    if (populate) {
        return Forum.findOne({ forum_id: id }).populate(populate);
    }

    return Forum.findOne({ forum_id: id });
}

export async function findTopicById(id: string | number, populate?: { path: string }): Promise<any> {
    if (!isNumeric(id)) {
        if (populate) {
            return Topic.findOne({ _id: id }).populate(populate);
        }

        return Topic.findOne({ _id: id });
    }

    if (populate) {
        return Topic.findOne({ topic_id: id }).populate(populate);
    }

    return Topic.findOne({ topic_id: id });
}

export async function findPostById(id: string | number, populate?: { path: string }): Promise<any> {
    if (!isNumeric(id)) {
        if (populate) {
            return Post.findOne({ _id: id }).populate(populate);
        }

        return Post.findOne({ _id: id });
    }

    if (populate) {
        return Post.findOne({ post_id: id }).populate(populate);
    }

    return Post.findOne({ post_id: id });
}

