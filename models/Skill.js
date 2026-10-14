import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Skill category label is required'],
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
export default Skill;

