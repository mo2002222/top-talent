const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const viewSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  }
});

viewSchema.index({ postId: 1, userId: 1 }); // Optional for performance

module.exports = mongoose.model('View', viewSchema);
