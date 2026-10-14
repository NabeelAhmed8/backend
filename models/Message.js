import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Valid email is required'],
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;

