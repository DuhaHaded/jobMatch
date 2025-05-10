import express from 'express';

import JobModel from '../../../db/model/job.model.js';
import UserModel from '../../../db/model/user.model.js';
import bcrypt from 'bcryptjs';

// ==========================================================
// إضافة وظيفة جديدة
// ==========================================================
// Create a new job
export const addJob = async (req, res) => {
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


// ==========================================================
// عرض جميع وظائف الشركة
// ==========================================================
export const getAllCompanyJobs = async (req, res) => {
  try {
    const jobs = await JobModel.find({ companyId: req.user._id });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================================================
// عرض تفاصيل وظيفة واحدة (عند الضغط على Show من الواجهة)
// ==========================================================
export const getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await JobModel.findOne({ _id: jobId, companyId: req.user._id }).select("title description location salary requirements createdAt");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================================================
// تحديث وظيفة
// ==========================================================
export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updatedJob = await JobModel.findOneAndUpdate(
      { _id: jobId, companyId: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job updated", job: updatedJob });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================================================
// حذف وظيفة
// ==========================================================
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const deleted = await JobModel.findOneAndDelete({ _id: jobId, companyId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================================================
// تحديث البروفايل (اسم الشركة، الايميل، الموقع، رقم الهاتف، نبذة)
// ==========================================================
export const updateProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.profileImage = req.file.path;
    }
    const updated = await UserModel.findByIdAndUpdate(req.user._id, updateData, { new: true });
    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================================================
// تغيير كلمة المرور للشركة
// ==========================================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================================================
// عرض المرشحين المتقدمين لوظيفة مع نسبة التطابق فقط
// ==========================================================
export const getCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await JobModel.findOne({ _id: jobId, companyId: req.user._id }).populate('applicants', 'fullName matchPercentage');
    if (!job) {
      return res.status(404).json({ message: "Job not found or access denied" });
    }
    const candidates = job.applicants.map((app) => ({
      _id: app._id,
      fullName: app.fullName,
      matchPercentage: app.matchPercentage || 0
    }));
    res.status(200).json(candidates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==========================================================
// عرض تفاصيل مرشح عند الضغط على اسمه
// ==========================================================
export const getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await UserModel.findById(candidateId).select('fullName email phone experience skills');
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json(candidate);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
