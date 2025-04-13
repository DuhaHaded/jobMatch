
import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware.js';
 //  استدعاء الميدل وير

const router = Router();

// هذا راوت محمي، ما يشتغل إلا لو المستخدم معاه توكن
router.get('/profile', auth, (req, res) => {
  res.json({
    message: 'This is your profile',
    user: req.user // البيانات اللي جات من التوكن
  });
});

export default router;
