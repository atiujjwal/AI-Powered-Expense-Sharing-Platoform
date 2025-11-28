import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmailOtp = async (email: string, otp: string) => {
  try {
    const mailOptions = {
      from: `"pAIse App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Verification OTP",
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Verification Code</h2>
              <p>Your OTP is:</p>
              <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
              <p>This OTP expires in 5 minutes.</p>
            </div>
          `,
    };
    const response = await transporter.sendMail(mailOptions);
    if (response?.rejected?.length == 0) {
      console.log(
        `Email OTP sent successfully: ${response}, MessageId: ${response.messageId}`
      );
      return true;
    }
    return false;
  } catch (error) {
    console.log("Error in sendEmailOtp: ", error);
    return false;
  }
};
