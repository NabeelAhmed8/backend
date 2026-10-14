import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['dev', 'ops', 'all'],
      default: 'dev',
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);
export default Experience;

