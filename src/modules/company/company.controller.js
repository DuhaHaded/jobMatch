import mongoose from 'mongoose';
import JobModel from '../../../db/model/job.model.js';
import UserModel from '../../../db/model/user.model.js';

// عرض كل الوظائف المنشورة
export const getMyJobs = async (req, res) => {
  try {
    const companyId = req.user.id;

    const jobs = await JobModel.find({ company: companyId })
      .populate('company', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ message: 'My posted jobs', jobs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get jobs', error: error.message });
  }
};

// تعديل على الوظيفة
export const updateJob = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { jobId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    const job = await JobModel.findOne({ _id: jobId, company: companyId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    const updatedJob = await JobModel.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true
    });

    res.json({ message: 'Job updated successfully', job: updatedJob });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
};

// حذف وظيفة
export const deleteJob = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    const job = await JobModel.findOne({ _id: jobId, company: companyId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    await JobModel.findByIdAndDelete(jobId);

    res.json({ message: 'Job deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

// جلب المرشحين
export const getJobCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    const job = await JobModel.findOne({ _id: jobId, company: companyId })
      .populate('candidates.user');

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const candidates = job.candidates.map((app) => ({
      id: app.user._id,
      fullName: app.user.fullName,
      matchPercentage: app.matchPercentage,
    }));

    res.status(200).json({ candidates });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching candidates', error: err.message });
  }
};

// تفاصيل المرشح
export const getCandidateDetails = async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    const companyId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const job = await JobModel.findOne({ _id: jobId, company: companyId })
      .populate('candidates.user');

    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const candidate = job.candidates.find(
      (c) => c.user._id.toString() === candidateId
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found for this job' });
    }

    const user = candidate.user;

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      experience: user.experience,
      skills: user.skills,
      matchPercentage: candidate.matchPercentage,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching candidate details', error: err.message });
  }
};

//شغل ايه
// Create a new job
export const createJob = async (req, res) => {
  try {
    // Extract job data from request body
    const { title, description, skills, location, deadline, numberOfPositions } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        success: false,
        message: "Title and description are required" 
      });
    }

    // Create job data object
    const jobData = {
      title,
      description,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      location,
      deadline: deadline ? new Date(deadline) : undefined,
      numberOfPositions: numberOfPositions || 1,
      company: req.user._id, // Set company to the authenticated user's ID
    };

    // Create new job
    const newJob = new JobModel(jobData);
    const savedJob = await newJob.save();

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: savedJob,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
//profile
// Update company profile
export const updateCompanyProfile = async (req, res) => {
  try {
    const { companyName, email, phone, location, bio } = req.body;
    
    // Find user by ID from the JWT token
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Email is already in use" 
        });
      }
    }

    // Update user fields
    user.companyName = companyName || user.companyName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.location = location || user.location;
    user.bio = bio || user.bio;

    // Handle profile image if provided
    if (req.file) {
      // Create uploads directory if it doesn't exist
      const uploadDir = "uploads/profile-images";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Delete old profile image if exists
      if (user.profileImage && user.profileImage.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new profile image path
      user.profileImage = `/uploads/profile-images/${req.file.filename}`;
    }

    // Save updated user
    await user.save();

    // Return updated user without password
    const updatedUser = await UserModel.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user by ID
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};






  