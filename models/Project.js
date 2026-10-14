import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Commercial Platform',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    stack: {
      type: [String],
      default: ['React', 'Tailwind CSS'],
    },
    liveUrl: {
      type: String,
      default: '#',
      trim: true,
    },
    githubUrl: {
      type: String,
      default: '#',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: true,
    },
    year: {
      type: String,
      default: () => String(new Date().getFullYear()),
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;

