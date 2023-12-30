import { Document, Model } from "mongoose";
import { IForum, ITopic, IUser, ForumInfo, TopicInfo, UserInfoCompact, instance, Forum, User, Topic } from "@/database";

export interface PostInfo {
    id: string;
    post_id: number;
    forum: ForumInfo | string;
    topic: TopicInfo | string;
    author: UserInfoCompact | string;
    content: string;
    upvote_count: number;
    downvote_count: number;
    vote_score: number;
    created_at: Date;
    edited_by?: UserInfoCompact | string;
    edited_at?: Date;
    deleted_at?: Date;
}

export interface IPost extends Document {
    post_id: number;
    forum: IForum | string;
    topic: ITopic | string;
    author: IUser | string;
    content: string;
    upvote_count: number;
    downvote_count: number;
    vote_score: number;
    created_at: Date;
    edited_by?: IUser | string;
    edited_at?: Date;
    deleted_at?: Date;
}

interface GetInfoOptions {
    populateForum?: boolean;
    populateTopic?: boolean;
    populateAuthor?: boolean;
}

interface PostMethods {
    getInfo(options?: GetInfoOptions): Promise<PostInfo>;
}

interface PostModel extends Model<IPost, NonNullable<unknown>, PostMethods> {
}

const PostSchema = new instance.Schema<IPost, PostModel, PostMethods>(
    {
        post_id: { type: Number, required: true, index: true, unique: true },
        forum: { type: instance.Schema.Types.ObjectId, ref: "Forum", required: true },
        topic: { type: instance.Schema.Types.ObjectId, ref: "Topic", required: true },
        author: { type: instance.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        upvote_count: { type: Number, default: 0 },
        downvote_count: { type: Number, default: 0 },
        vote_score: { type: Number, default: 0 },
        created_at: { type: Date, default: Date.now() },
        edited_by: { type: instance.Schema.Types.ObjectId, ref: "User" },
        edited_at: { type: Date },
        deleted_at: { type: Date },
    },
    {
        collection: "posts",
    },
);

PostSchema.pre("save", function() {
    this.set({ created_at: Date.now() });
});

// eslint-disable-next-line no-unused-vars
PostSchema.methods.getInfo = async function(this: IPost, options?: GetInfoOptions): Promise<PostInfo> {
    const info: PostInfo = {
        id: this._id,
        post_id: this.post_id,
        forum: this.forum.toString(),
        topic: this.topic.toString(),
        author: this.author.toString(),
        content: this.content,
        upvote_count: this.upvote_count,
        downvote_count: this.downvote_count,
        vote_score: this.vote_score,
        created_at: this.created_at,
        edited_by: this.edited_by?.toString(),
        edited_at: this.edited_at,
        deleted_at: this.deleted_at,
    };

    if (options?.populateForum) {
        const forum = await Forum.findOne({ "_id": this.forum });

        if (forum) {
            info.forum = await forum.getInfo();
        }
    }

    if (options?.populateTopic) {
        const topic = await Topic.findOne({ "_id": this.topic });

        if (topic) {
            info.topic = await topic.getInfo();
        }
    }

    if (options?.populateAuthor) {
        const author = await User.findOne({ "_id": this.author });

        if (author) {
            info.author = await author.getInfoCompact();
        }

        if (this.edited_by) {
            const user = await User.findOne({ "_id": this.edited_by });

            if (user) {
                info.edited_by = await user.getInfoCompact();
            }
        }
    }

    return info;
};

export const Post = instance.model<IPost, PostModel>("Post", PostSchema);
