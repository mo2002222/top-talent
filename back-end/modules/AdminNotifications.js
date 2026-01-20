const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AdminNotification = new schema(
     {
    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["approved", "flagged"],
      required: true,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    postUrl: {
      type: String,
      required: true,
    },

    cloudinaryUrls: [
      {
        type: String,
      },
    ],

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("AdminNotification", AdminNotification);