import nodemailer from "nodemailer"
import crypto from "crypto"

// Generate a short alphanumeric verification code
export const generateVerificationCode = () => {
    return crypto.randomBytes(3).toString("hex").toUpperCase() // e.g. "A4C2D8"
}

// Create mail transporter
const transporter = nodemailer.createTransport({
    service: "yahoo",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

const sendVerificationEmail = async (to, code) => {
    try {
        await transporter.sendMail({
            from: `Exhiby <${process.env.EMAIL_USER}>`,
            to,
            subject: "Exhiby - Verify Your Email Address",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5">
                    <h2>Verify your email address</h2>
                    <p>Use the code below to verify your account:</p>
                    <div style="font-size: 22px; font-weight: bold; color: #2d89ef; margin: 10px 0;">${code}</div>
                    <p>This code expires in <strong>10 minutes</strong>.</p>
                    <p>If you didn’t request this, please ignore this email.</p>
                    <br/>
                    <p>— The Exhiby Team</p>
                </div>
            `
        })
    } catch (error) {
        console.error("Failed to send verification email:", error)
        throw new Error("Email delivery failed")
    }
}

export default sendVerificationEmail
