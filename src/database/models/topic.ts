import { Document, Model } from "mongoose";
import { IForum, IPost, IUser, ForumInfo, PostInfo, UserInfoCompact, instance, Forum, User, Post } from "@/database";

export interface TopicInfo {
    id: string;
    topic_id: number;
    forum: ForumInfo | string;
    title: string;
    author: UserInfoCompact | string;
    post_count: number;
    view_count: number;
    first_post: PostInfo | string;
    last_post: PostInfo | string;
    is_locked: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface ITopic extends Document {
    topic_id: number;
    forum: IForum | string;
    title: string;
    author: IUser;
    post_count: number;
    view_count: number;
    first_post: IPost | string;
    last_post: IPost | string;
    is_locked: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

interface GetInfoOptions {
    populateForum?: boolean;
    populateAuthor?: boolean;
    populatePost?: boolean;
}

interface TopicMethods {
    getInfo(options?: GetInfoOptions): Promise<TopicInfo>;
}

interface TopicModel extends Model<ITopic, NonNullable<unknown>, TopicMethods> {
}

const TopicSchema = new instance.Schema<ITopic, TopicModel, TopicMethods>(
    {
        topic_id: { type: Number, required: true, index: true, unique: true },
        forum: { type: instance.Schema.Types.ObjectId, ref: "Forum", required: true },
        title: { type: String, required: true },
        author: { type: instance.Schema.Types.ObjectId, ref: "User", required: true },
        post_count: { type: Number, default: 0 },
        view_count: { type: Number, default: 0 },
        first_post: { type: instance.Schema.Types.ObjectId, ref: "Post" },
        last_post: { type: instance.Schema.Types.ObjectId, ref: "Post" },
        is_locked: { type: Boolean, default: false },
        created_at: { type: Date, default: Date.now() },
        updated_at: { type: Date, default: Date.now() },
        deleted_at: { type: Date },
    },
    {
        collection: "topics",
    },
);

TopicSchema.pre("save", function() {
    this.set({ created_at: Date.now() });
});

// eslint-disable-next-line no-unused-vars
TopicSchema.methods.getInfo = async function(this: ITopic, options?: GetInfoOptions): Promise<TopicInfo> {
    const info: TopicInfo = {
        id: this._id,
        topic_id: this.topic_id,
        forum: this.forum.toString(),
        title: this.title,
        author: this.author.toString(),
        post_count: this.post_count,
        view_count: this.view_count,
        first_post: this.first_post.toString(),
        last_post: this.last_post.toString(),
        is_locked: this.is_locked,
        created_at: this.created_at,
        updated_at: this.updated_at,
        deleted_at: this.deleted_at,
    };

    if (options?.populateForum) {
        const forum = await Forum.findOne({ "_id": this.forum });

        if (forum) {
            info.forum = await forum.getInfo();
        }
    }

    if (options?.populateAuthor) {
        const author = await User.findOne({ "_id": this.author });

        if (author) {
            info.author = await author.getInfoCompact();
        }
    }

    if (options?.populatePost) {
        const [ first_post, last_post ] = await Promise.all([
            Post.findOne({ "_id": this.first_post }),
            Post.findOne({ "_id": this.last_post }),
        ]);

        if (first_post) {
            info.first_post = await first_post.getInfo({ populateAuthor: true });
        }

        if (last_post) {
            info.last_post = await last_post.getInfo({ populateAuthor: true });
        }
    }

    return info;
};

export const Topic = instance.model<ITopic, TopicModel>("Topic", TopicSchema);
