import * as controller from './auth.controller.js';
import { Router } from 'express';


const router = Router();


router.post('/signUp', controller.signUp);

router.post('/login', controller.login);

router.get('/', controller.getAll);

export default router;

