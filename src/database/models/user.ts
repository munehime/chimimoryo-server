import { Document, Model } from "mongoose";
import { IRole, Role, RoleInfo, instance } from "@/database";

export interface UserInfo {
    id: string;
    user_id: number;
    username: string;
    email: string;
    avatar: string;
    roles: Array<RoleInfo> | Array<string>;
    registered_at: Date;
    last_login: Date;
}

export interface UserInfoCompact {
    id: string;
    user_id: number;
    username: string;
    avatar: string;
    registered_at: Date;
    last_login: Date;
}


export interface IUser extends Document {
    user_id: number;
    username: string;
    email: string;
    password: string;
    avatar: string;
    roles: Array<IRole> | Array<string>;
    registered_at: Date;
    last_login: Date;
}

interface GetInfoOptions {
    populateRoles?: boolean;
}

interface UserMethods {
    getInfo(options?: GetInfoOptions): Promise<UserInfo>;

    getInfoCompact(): Promise<UserInfoCompact>;
}

interface UserModel extends Model<IUser, NonNullable<unknown>, UserMethods> {
}

const UserSchema = new instance.Schema<IUser, UserModel, UserMethods>(
    {
        user_id: { type: Number, required: true, index: true, unique: true },
        username: { type: String, required: true, index: true, unique: true },
        email: { type: String, required: true, index: true, unique: true },
        password: { type: String, required: true },
        avatar: { type: String, default: "" },
        roles: { type: [ instance.Schema.Types.ObjectId ], ref: "Role", required: true },
        registered_at: { type: Date, default: Date.now() },
        last_login: { type: Date, default: Date.now() },
    },
    {
        collection: "users",
    },
);

UserSchema.pre("save", function() {
    this.set({ created_at: Date.now() });
});

// eslint-disable-next-line no-unused-vars
UserSchema.methods.getInfo = async function(this: IUser, options?: GetInfoOptions): Promise<UserInfo> {
    const info: UserInfo = {
        id: this._id,
        user_id: this.user_id,
        username: this.username,
        email: this.email,
        avatar: this.avatar,
        roles: this.roles as Array<string>,
        registered_at: this.registered_at,
        last_login: this.last_login,
    };

    if (options?.populateRoles) {
        const roles = await Role.find({
            "_id": {
                $in: this.roles,
            },
        });

        info.roles = await Promise.all(roles.map(async (role) => role.getInfo())) as Array<RoleInfo>;
    }

    return info;
};

// eslint-disable-next-line no-unused-vars
UserSchema.methods.getInfoCompact = async function(this: IUser): Promise<UserInfoCompact> {
    return {
        id: this._id,
        user_id: this.user_id,
        username: this.username,
        avatar: this.avatar,
        registered_at: this.registered_at,
        last_login: this.last_login,
    };
};

export const User = instance.model<IUser, UserModel>("User", UserSchema);
