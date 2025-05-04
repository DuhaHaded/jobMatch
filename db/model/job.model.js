import mongoose from 'mongoose';



const jobSchema = new mongoose.Schema({
   
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: String },
  location: { type: String },
  salary: { type: String },
  type: {
    type: String,
    enum: ["full-time", "part-time", "remote", "hybrid"],
    default: "full-time"
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidates: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      matchPercentage: {
        type: Number,
        required: true
      }
    }
  ],
  skills: {
    type: [String],
    default: []
  },
  numberOfPositions: {
    type: Number,
    required: true,
    default: 1
  }
}, {
  timestamps: true
});
const JobModel = mongoose.model("Job", jobSchema);
export default JobModel;

