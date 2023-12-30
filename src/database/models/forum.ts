import { Document, Model } from "mongoose";
import { IPost, Post, PostInfo, instance } from "@/database";

export type ForumCategory = "songs" | "gameplay" | "other" | "language-specific"

export interface ForumInfo {
    id: string;
    forum_id: number;
    title: string;
    description: string;
    category: ForumCategory;
    latest_post?: PostInfo | string;
    created_at: Date;
    updated_at: Date;
}

export interface IForum extends Document {
    forum_id: number;
    title: string;
    description: string;
    category: ForumCategory;
    latest_post?: IPost | string;
    created_at: Date;
    updated_at: Date;
}

interface GetInfoOptions {
    populatePost?: boolean;
}

interface ForumMethods {
    getInfo(options?: GetInfoOptions): Promise<ForumInfo>;
}

interface ForumModel extends Model<IForum, NonNullable<unknown>, ForumMethods> {
}

const ForumSchema = new instance.Schema<IForum, ForumModel, ForumMethods>(
    {
        forum_id: { type: Number, required: true, index: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true, enum: [ "songs", "gameplay", "other", "language-specific" ] },
        latest_post: { type: instance.Schema.Types.ObjectId, ref: "Post" },
        created_at: { type: Date, default: Date.now() },
        updated_at: { type: Date, default: Date.now() },
    },
    {
        collection: "forums",
    },
);

ForumSchema.pre("save", function() {
    this.set({ created_at: Date.now() });
});

// eslint-disable-next-line no-unused-vars
ForumSchema.methods.getInfo = async function(this: IForum, options?: GetInfoOptions): Promise<ForumInfo> {
    const info: ForumInfo = {
        id: this._id,
        forum_id: this.forum_id,
        title: this.title,
        description: this.description,
        category: this.category,
        latest_post: this.latest_post?.toString(),
        created_at: this.created_at,
        updated_at: this.updated_at,
    };

    if (options?.populatePost) {
        const post = await Post.findOne({ "_id": this.latest_post });

        if (post) {
            info.latest_post = await post.getInfo({ populateTopic: true, populateAuthor: true });
        }
    }

    return info;
};

export const Forum = instance.model<IForum, ForumModel>("Forum", ForumSchema);
