import logger from "@/logger";
import { User, UserInfo } from "@/database";
import { StatusCode } from "@/enums";
import { isNumeric } from "@/utils";

export const getMany = async (
    skip?: number
): Promise<{
    status: StatusCode;
    data: {
        users?: Array<UserInfo>;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const users = await User.find({}, {}, { skip: skip ?? 0, limit: 50 });
        const usersInfo = await Promise.all(users.map(async (user) => await user.getInfo({populateRoles: true})));

        return {
            status: StatusCode.OK,
            data: { users: usersInfo },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: 'Internal Server Error'
            }
        };
    }
};

export const getOne = async (
    id: string | number
): Promise<{
    status: StatusCode;
    data: {
        user?: UserInfo;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const user = await findUserById(id);

        if (!user) {
            return {
                status: StatusCode.NOT_FOUND,
                data: {
                    error: "No user found",
                },
            };
        }

        return {
            status: StatusCode.OK,
            data: { user: await user.getInfo({ populateRoles: true }) },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: 'Internal Server Error'
            }
        };
    }
};

export async function findUserById(id: string | number, populate?: { path: string }): Promise<any> {
    if (!isNumeric(id)) {
        if (populate) {
            return User.findOne({ _id: id }).populate(populate);
        }

        return User.findOne({ _id: id });
    }

    if (populate) {
        return User.findOne({ user_id: id }).populate(populate);
    }

    return User.findOne({ user_id: id });
}
