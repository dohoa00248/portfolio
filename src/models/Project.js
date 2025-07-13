import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    tech: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    live: {
      type: String,
    },
    github: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
