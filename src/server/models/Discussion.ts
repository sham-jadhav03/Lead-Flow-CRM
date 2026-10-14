import { model, Schema, Types } from "mongoose";

export interface IDiscussion {
  leadId: Types.ObjectId;
  note: string;
  followUpAt: Date | null;
  createdAt?: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    followUpAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

discussionSchema.index({ leadId: 1, createAt: -1 });

discussionSchema.set("toJSON", {
  transform: (_doc, raw) => {
    const ret = raw as unknown as Record<string, unknown>;
    ret.id = String(ret._id);
    ret.leadId = String(ret.leadId);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const discussionModel = model<IDiscussion>("Discussion", discussionSchema);

export default discussionModel;
