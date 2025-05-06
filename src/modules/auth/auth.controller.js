import UserModel from '../../../db/model/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/email.utils.js';
import crypto from 'crypto';  



// 🟢 تسجيل مستخدم جديد
export const signUp = async (req, res) => {
  try {
    console.log("📥 Received data from frontend:", req.body);

    const { fullName, email, password, type, companyName } = req.body;

    // ✅ تحقق من طول الباسورد
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALTROUND));
    const newUser = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
      type,
      companyName: type === 'company' ? companyName : null
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.fullName,
        email: newUser.email,
        type: newUser.type
      }
    });

  } catch (error) {
    console.error('SignUp Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🟡 استرجاع جميع المستخدمين (للاختبار أو لوحة الإدارة)
export const getAll = async (req, res) => {
  try {
    const users = await UserModel.find({}, '-password'); // استبعاد كلمة المرور
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔐 Forgot Password - Send reset code to email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetCode = crypto.randomBytes(3).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetCode = resetCode;
    user.resetCodeExpires = expires;
    await user.save();

    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 500px; margin: auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p style="font-size: 16px;">You requested to reset your password. Please use the following code:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #007bff;">${resetCode}</div>
      <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
      <hr />
      <p style="font-size: 12px; color: #999;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
  

    await sendEmail(user.email, 'Password Reset Code', html);

    res.json({ message: 'Reset code sent to your email' });

  } catch (error) {
    console.error('ForgotPassword Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🔵 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user || user.resetCode !== code) {
      return res.status(400).json({ message: 'Invalid code or email' });
    }

    if (user.resetCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code expired' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('ResetPassword Error:', error);
    res.status(500).json({ message: error.message });
  }
};



// 🟣 تسجيل دخول مستخدم
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.status !== 'Active') {
      return res.status(400).json({ message: 'Account is not active' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        type: user.type,
        status: user.status
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        type: user.type,
        ...(user.type === 'company' && { companyName: user.companyName })
      }
    });

  } catch (error) {
    console.error('SignIn Error:', error);
    res.status(500).json({ message: error.message });
  }
};