import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { StatusCode } from "@/enums";
import { Counter, Role, User } from "@/database";
import logger from "@/logger";

interface UserData {
    username: string;
    email?: string;
    password: string;
}

export const signin = async (
    data: UserData
): Promise<{
    status: StatusCode;
    data: {
        access_token?: string;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const user = await User.findOne({ username: data.username });
        const now = new Date();

        if (!user) {
            return {
                status: StatusCode.BAD_REQUEST,
                data: {
                    message: "Invalid username or password"
                }
            };
        }

        const salt = user.password.slice(0, 24);
        const userPassword = user.password.slice(24);
        const hashedPassword = crypto.pbkdf2Sync(data.password, salt, 310000, 48, "sha256");

        if (!crypto.timingSafeEqual(Buffer.from(userPassword, "base64"), hashedPassword)) {
            return {
                status: StatusCode.BAD_REQUEST,
                data: {
                    message: "Invalid username or password"
                }
            };
        }

        user.last_login = now;

        await user.save();

        const accessToken = jwt.sign({ id: user._id, user_id: user.user_id, username: user.username }, "TOP_SECRET_KEY", { expiresIn: "24h", });

        return {
            status: StatusCode.OK,
            data: {
                access_token: accessToken
            }
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: 'Internal server error'
            }
        };
    }
};

export const signup = async (
    data: UserData,
): Promise<{
    status: StatusCode;
    data: {
        access_token?: string;
        message?: string;
        error?: string;
    };
}> => {
    try {
        const user = await User.findOne({
            $or: [
                { username: data.username },
                { email: data.email },
            ],
        });

        if (user) {
            if (user.username === data.username) {
                return {
                    status: StatusCode.BAD_REQUEST,
                    data: { error: "Username already existed in database" },
                };
            }

            if (user.email === data.email) {
                return {
                    status: StatusCode.BAD_REQUEST,
                    data: { error: "Email already existed in database" },
                };
            }

            return {
                status: StatusCode.BAD_REQUEST,
                data: { error: "User existed in database" },
            };
        }

        const salt = crypto.randomBytes(16).toString("base64");
        const hash = crypto.pbkdf2Sync(data.password, salt, 310000, 48, "sha256");
        const hashedPassword = `${salt}${hash.toString("base64")}`;


        let usersRole = await Role.findOne({ name: "users" });

        if (!usersRole) {
            usersRole = await Role.create({ name: "users" });
        }

        let counter = await Counter.findOneAndUpdate({ coll: "users" }, { $inc: { seq: 1 } }, { new: true });

        if (!counter) {
            counter = await Counter.create({
                coll: "users",
                seq: 1,
            });
        }

        const now = new Date();
        const usr = await User.create({
            user_id: counter.seq,
            username: data.username,
            email: data.email,
            password: hashedPassword,
            avatar: "https://a.ppy.sh/guest.png",
            roles: [usersRole],
            registered_at: now,
            last_login: now
        });

        const accessToken = jwt.sign({ id: usr._id, user_id: usr.user_id, username: usr.username }, "TOP_SECRET_KEY", { expiresIn: "24h", });

        return {
            status: StatusCode.OK,
            data: { access_token: accessToken },
        };
    } catch (err: any) {
        logger.error(err);

        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            data: {
                message: 'Internal server error'
            }
        };
    }
};
