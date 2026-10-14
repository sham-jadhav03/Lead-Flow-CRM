import { LeadStatus, STATUSES } from "@/src/lib/contansts";
import { model, Model, Schema } from "mongoose";

export interface ILead {
  name: string;
  company?: string;
  phone?: string;
  status: LeadStatus;
  followUpAt: Date | null;
  lastNote: string | null;
  lastDiscussionAt: Date | null;
  createdAt?: Date;
}

const leadSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 100,
    },
    company: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    phone: {
      type: String,
      trim: true,
      maxLength: 30,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "New",
      index: true,
    },
    followUpAt: {
      type: Date,
      default: null,
    },
    lastNote: {
      type: String,
      default: null,
    },
    lastDiscussionAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

leadSchema.set("toJSON", {
  transform: (_doc, raw) => {
    const ret = raw as unknown as Record<string, unknown>;
    ret.id = String(ret._id);
    delete ret._id;
    delete ret._v;
    return ret;
  },
});

const leadModel: Model<ILead> = model<ILead>("Lead", leadSchema);

export default leadModel;
