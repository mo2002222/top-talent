const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", ContactMessageSchema);
