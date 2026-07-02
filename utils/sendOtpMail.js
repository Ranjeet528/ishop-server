const nodemailer = require("nodemailer");

const sendOtpMail = async (toEmail, otp)=>{
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail",
            port: 587,
            secure: false,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

      const mailOptions = {
  from: `"Ishop website" <${process.env.EMAIL_USER}>`,
  to: toEmail,
  subject: "Verify Your Email - OTP",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      
      <h2 style="color: #333; text-align: center;">
        Welcome to Ishop 🛍️
      </h2>

      <p>Hello,</p>

      <p>
        Thank you for registering on <strong>Ishop</strong>.
        Please use the OTP below to verify your email address:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 5px; background: #f4f4f4; padding: 15px 25px; border-radius: 8px;">
          ${otp}
        </span>
      </div>

      <p>
        This OTP is valid for <strong>5 minutes</strong>.
      </p>

      <p>
        If you did not create this account, you can safely ignore this email.
      </p>

      <hr />

      <p style="font-size: 12px; color: gray; text-align: center;">
        © 2026 Ishop. All rights reserved.
      </p>
    </div>
  `

};
 await transporter.sendMail(mailOptions);
 return " Otp email sent seccessfully";
        
    } catch (error) {
        console.log(error," otperror")
        return " Email sending fail" + error.message;
        
    }
}
 module.exports = sendOtpMail;