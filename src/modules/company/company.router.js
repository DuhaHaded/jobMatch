import { Router } from "express";
import * as companyController from './company.controller.js';
import  {auth}  from '../../middleware/auth.middleware.js';
const router = Router();
router.get('/postedJobs', auth, companyController.getPostedJobs);
export default router;
