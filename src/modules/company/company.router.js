import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import multer from 'multer';
import * as companyController from './company.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // لحفظ صورة البروفايل


// 🟢 إضافة وظيفة جديدة
router.post('/addJob', auth, companyController.addJob);

// 🟢 عرض جميع وظائف الشركة
router.get('/jobs', auth, companyController.getAllCompanyJobs);

// 🟢 عرض تفاصيل وظيفة واحدة (زر Show)
router.get('/job/:jobId', auth, companyController.getJobDetails);

// 🟢 تحديث وظيفة
router.put('/updateJob/:jobId', auth, companyController.updateJob);

// 🟢 حذف وظيفة
router.delete('/deleteJob/:jobId', auth, companyController.deleteJob);

// 🟢 عرض المرشحين مع نسبة تطابقهم لوظيفة معينة
router.get('/candidates/:jobId', auth, companyController.getCandidatesForJob);

// 🟢 عرض تفاصيل مرشح معيّن
router.get('/candidate/:candidateId', auth, companyController.getCandidateDetails);

// 🟢 تحديث بروفايل الشركة
router.put('/updateProfile', auth, upload.single('profileImage'), companyController.updateProfile);

// 🟢 تغيير كلمة المرور
router.put('/changePassword', auth, companyController.changePassword);

export default router;