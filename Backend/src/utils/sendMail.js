import { transporter } from "../config/nodemailer.config.js";

export const sendVerificationEmail = async (toEmail, userName, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Social Vista - Email Verification Code",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
                    <h2>Hello ${userName},</h2>
                    <p>Thank you for registering with Social Vista! Please use the verification code below to complete your registration.</p>
                    <div style="background-color: #f2f2f2; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #333;">${otpCode}</h1>
                    </div>
                    <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                    <p>Thanks,<br>The Social Vista Team</p>
                </div>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);

    throw new Error("Failed to send verification email.");
  }
};
