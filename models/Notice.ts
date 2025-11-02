import mongoose, { Schema } from "mongoose";

const NoticeSchema = new Schema({
  title: String,
  category: String,
  date: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
