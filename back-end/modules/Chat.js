const mongoose = require('mongoose');
const schema = mongoose.Schema;

const Chat = new schema(
  { 
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      // required: false,
    },
    imageUrl: { type: String },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Chat", Chat);
