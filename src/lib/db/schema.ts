import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    citraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citra",
      required: true,
    },
    courseCode: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    mode: { type: String, enum: ["Online", "Face-to-Face"], required: true },
    takeAgain: { type: Boolean, required: true },
    slidesProvided: { type: Boolean, required: true },
    attendanceMandatory: { type: Boolean, required: true },
    grade: { type: String, required: true },
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Rating =
  mongoose.models.Rating || mongoose.model("Rating", RatingSchema);

const CitraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  citraType: { type: String, required: true }, // e.g., "Entrepreneurship", "Language", etc.
  faculty: { type: String, required: true },
});

export const Citra =
  mongoose.models.Citra || mongoose.model("Citra", CitraSchema);
