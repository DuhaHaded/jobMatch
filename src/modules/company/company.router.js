import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import * as companyController from './company.controller.js';
import { getJobCandidates, getCandidateDetails } from './company.controller.js';
import multer from "multer";
import path from "path";
import fs from 'fs';  // تأكد من استيراد fs

const router = Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profile-images";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// استرجاع الوظائف التي نشرتها الشركة
router.get('/myJobs', auth, companyController.getMyJobs);

// تعديل على الوظائف
router.put('/editJob/:jobId', auth, companyController.updateJob);

// حذف وظيفة
router.delete('/deleteJob/:jobId', auth, companyController.deleteJob);

// استرجاع المرشحين لوظيفة معينة
router.get('/job/:jobId/candidates', auth, getJobCandidates);

// استرجاع تفاصيل مرشح
router.get('/job/:jobId/candidate/:candidateId', auth, getCandidateDetails);

// إضافة وظيفة جديدة
router.post('/addjobs', auth, companyController.createJob);

// GET - Get company profile
router.get("/profile", auth, companyController.getCompanyProfile);

// PUT - Update company profile
router.put("/profile", auth, companyController.updateCompanyProfile);

// PUT - Change password
router.put("/change-password", auth, companyController.changePassword);

// **راوت رفع صورة البروفايل**
router.post('/uploadProfileImage', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const imagePath = `/uploads/profile-images/${req.file.filename}`;

    // هنا يمكن إضافة الكود لتحديث صورة بروفايل الشركة في قاعدة البيانات
    await companyController.updateProfileImage(req.user.companyId, imagePath);

    res.status(200).json({ message: 'Profile image uploaded successfully!', imagePath });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

export default router;

