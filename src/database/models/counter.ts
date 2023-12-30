import { Document, Model } from "mongoose";
import { instance } from "@/database";

export interface ICounter extends Document {
    coll: string;
    seq: number;
    created_at: Date;
    updated_at: Date;
}

interface CounterMethods { }

interface CounterModel extends Model<ICounter, NonNullable<unknown>, CounterMethods> { }

const CounterSchema = new instance.Schema<ICounter, CounterModel, CounterMethods>(
    {
        coll: { type: String, required: true },
        seq: { type: Number, required: true },
        created_at: { type: Date, default: Date.now() },
        updated_at: { type: Date, default: Date.now() },
    },
    {
        collection: "counters",
    }
);

CounterSchema.pre("save", function () {
    this.set({ created_at: Date.now() });
});

CounterSchema.pre("updateOne", function () {
    this.set({ updated_at: Date.now() });
});

export const Counter = instance.model<ICounter, CounterModel>("Counter", CounterSchema);
