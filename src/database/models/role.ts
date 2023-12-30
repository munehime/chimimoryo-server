import { Document, Model } from "mongoose";
import { instance } from "@/database";

export interface RoleInfo {
    id: string;
    name: string;
}

export interface IRole extends Document {
    name: string;
}
interface RoleMethods {
    getInfo(): Promise<RoleInfo>;
}

interface RoleModel extends Model<IRole, NonNullable<unknown>, RoleMethods> { }

const RoleSchema = new instance.Schema<IRole, RoleModel, RoleMethods>(
    {
        name: { type: String, required: true, index: true, unique: true },
    },
    {
        collection: "roles",
    }
);

// eslint-disable-next-line no-unused-vars
RoleSchema.methods.getInfo = async function (this: IRole): Promise<RoleInfo> {
    return {
        id: this._id,
        name: this.name
    };
};

export const Role = instance.model<IRole, RoleModel>("Role", RoleSchema);
