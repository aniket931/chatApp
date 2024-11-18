import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  files: [
    {
      type: String,
    }
  ],
  sent: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Conversations = mongoose.model('Conversation', ConversationSchema);

