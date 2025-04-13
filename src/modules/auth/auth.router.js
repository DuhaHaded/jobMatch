import * as controller from './auth.controller.js';
import { Router } from 'express';


const router = Router();


router.post('/signUp', controller.signUp);

router.post('/signIn', controller.signIn);
router.post('/forgotPassword', controller.forgotPassword);
router.post('/resetPassword', controller.resetPassword);



router.get('/', controller.getAll);

export default router;

