import UserModel from '../../../db/model/user.model.js';


import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

//signUp
export const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, type, companyName } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALTROUND));
    const newUser = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      type,
      companyName: type === 'company' ? companyName : null
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        type: newUser.type
      }
    });

  } catch (error) {
    console.error('SignUp Error:', error);
    res.status(500).json({ message: error.message });
  }
};
//getAll
export const getAll = async (req, res) => {
  try {
    const users = await UserModel.find({}, '-password'); // استبعاد كلمات المرور
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//forgotPassword – طلب استعادة كلمة المرور حاليال الكود بنرسله هون 
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetCode = crypto.randomBytes(3).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة

    user.resetCode = resetCode;
    user.resetCodeExpires = expires;
    await user.save();

    // مؤقتًا نطبع الكود
    console.log( `Reset code for ${email}: ${resetCode}`);

    res.json({ message: 'Reset code sent to your email' });

  } catch (error) {
    console.error('ForgotPassword Error:', error);
    res.status(500).json({ message: error.message });
  }
};
//اعادة تعين كلمة المرور
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
     //  تحقق من قوة الباسورد الجديدة
     if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
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

  //login
    export const login = async (req, res) => {
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
        if(user.status == "NotActive"){
          return res.status(400).json ({message :"your account is blocked ...."});
        }
        if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect password' });
        }
    
        // ✅ إنشاء JWT Token
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            role: user.role,
            type: user.type,
            status:user.status,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );
    
        res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            type: user.type,
            ...(user.type === 'company' && { companyName: user.companyName })
          }
        });
    
      } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
      }
    };

  
  
