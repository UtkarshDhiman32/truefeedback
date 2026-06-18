// import { resend } from "@/lib/resend";
// import VerificationEmail from "../../emails/VerificationEmail";
// import { ApiResponse } from "@/types/ApiResponse";

// export async function sendVerificationEmail(
//     email: string,
//     username: string,
//     verifyCode: string
// ): Promise<ApiResponse> {
//     try {
//         await resend.emails.send({
//             from: "onboarding@resend.dev",
//             to: email,
//             subject: "Mystery message | Verification code",
//             react: VerificationEmail({ username, otp: verifyCode }),
//         })
//         return { success: true, message: 'Verification email send successfully' }

//     } catch (emailError) {
//         console.log("Error Sending Verification Email", emailError)
//         return { success: false, message: 'Failed to send verification email' }
//     }
// }


// import { resend } from "@/lib/resend";
// import VerificationEmail from "../../emails/VerificationEmail";
// import { ApiResponse } from "@/types/ApiResponse";

// export async function sendVerificationEmail(
//     email: string,
//     username: string,
//     verifyCode: string
// ): Promise<ApiResponse> {
//     try {
//         // Resend ke response ko capture karein 🎯
//         const response = await resend.emails.send({
//             from: "onboarding@resend.dev",
//             to: email,
//             subject: "Mystery message | Verification code",
//             react: VerificationEmail({ username, otp: verifyCode }),
//         });

//         // Agar Resend ne koi error returned kiya hai (Jaise Sandbox restriction)
//         if (response.error) {
//             console.error("Resend API Error Details:", response.error);
//             return { 
//                 success: false, 
//                 message: response.error.message || 'Failed to send verification email' 
//             };
//         }

//         return { success: true, message: 'Verification email sent successfully' }

//     } catch (emailError) {
//         console.error("Error Sending Verification Email:", emailError);
//         return { success: false, message: 'Failed to send verification email' }
//     }
// }


import nodemailer from 'nodemailer';
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        // Nodemailer transporter configuration 🚀
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Email design aur content setup (HTML template)
        const mailOptions = {
            // from: `"Mystery Message" <${process.env.SMTP_USER}>`,
            from: `"True Feedback" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Mystery message | Verification code",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 25px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; text-align: center; color: #1f2937;">
                    <h2 style="color: #4f46e5; margin-bottom: 10px;">Hello @${username},</h2>
                    <p style="font-size: 16px; color: #4b5563;">Thank you for registering on True Feedback. Please use the following one-time verification code to complete your registration:</p>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 2px dashed #4f46e5; display: inline-block; margin: 20px 0;">
                        <h1 style="color: #4f46e5; font-size: 36px; letter-spacing: 5px; margin: 0; font-family: monospace;">${verifyCode}</h1>
                    </div>
                    <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">This verification code is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        };

        // Email successfully send kijiye
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Verification email sent successfully via Nodemailer' };

    } catch (emailError) {
        console.error("Error Sending Verification Email via Nodemailer:", emailError);
        return { success: false, message: 'Failed to send verification email' };
    }
}