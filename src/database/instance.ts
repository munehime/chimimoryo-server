import { Mongoose } from "mongoose";
import seeding from "./seeding";

export * as mongoose from "mongoose";
export { Document, Model, Types } from "mongoose";

interface DatabaseOptions {
    uri: string;
}

export const instance = new Mongoose();

export const connect = async (options: DatabaseOptions): Promise<void> => {
    try {
        await instance.connect(options.uri, {});
        // await seeding();
    } catch (err) {
        throw err;
    }
};

export const disconnect = async (): Promise<void> => {
    try {
        await instance.connection.close();
    } catch (err) {
        throw err;
    }
};


