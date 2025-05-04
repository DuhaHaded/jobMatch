import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    // إعداد النقل (Transport)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // مثل: 'gmail'
      auth: {
        user: process.env.EMAIL_USER,     // بريدك
        pass: process.env.EMAIL_PASS      // كلمة المرور أو App Password
      }
    });

    // إعداد الرسالة
    const mailOptions = {
      from: `"Job Match AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    // إرسال الإيميل
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw new Error('Failed to send email');
  }
};

