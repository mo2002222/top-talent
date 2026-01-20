const mongoose = require("mongoose");

const ContentReportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true, 
    },
    reason: {
      type: String,
      required: true,
    },
    message: String,
    email: String,
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContentReport", ContentReportSchema);
