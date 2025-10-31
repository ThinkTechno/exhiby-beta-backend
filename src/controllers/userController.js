import bcrypt from "bcrypt"
import User from "../models/userModel.js"
import sendVerificationEmail, { generateVerificationCode } from "../utils/sendVerificationEmail.js"
import generateTokens from "../utils/generateTokens.js"

// USER REGISTRATION HANDLER
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, accountType } = req.body

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] })
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationCode = generateVerificationCode()
        const hashedCode = await bcrypt.hash(verificationCode, 10)
        const codeExpiration = new Date(Date.now() + 10 * 60 * 1000)

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            accountType,
            verificationData: {
                status: "pending",
                code: hashedCode,
                expiresAt: codeExpiration
            }
        })

        const newUserResponse = await newUser.save()
        await sendVerificationEmail(email, verificationCode)

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
            user: newUserResponse
        })
    } catch (error) {
        console.error("Registration Error:", error)
        return res.status(500).json({ success: false, message: "Server error during registration" })
    }
}

// VERIFY USER EMAIL
const verifyUserEmail = async (req, res) => {
    try {
        const { email, code } = req.body
        const user = await User.findOne({ email })

        if (!user || user.verificationData.status === "verified") {
            return res.status(400).json({ success: false, message: "Invalid verification request" })
        }

        const isMatch = await bcrypt.compare(code, user.verificationData.code)
        const isExpired = user.verificationData.expiresAt < Date.now()

        if (!isMatch || isExpired) {
            return res.status(400).json({ success: false, message: "Invalid or expired code" })
        }

        user.verificationData = { status: "verified", code: null, expiresAt: null }
        await user.save()

        return res.status(200).json({ success: true, message: "Email verified successfully" })
    } catch (error) {
        console.error("Verify Email Error:", error)
        return res.status(500).json({ success: false, message: "Server error during email verification" })
    }
}


// USER LOGIN HANDLER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        if (user.verificationData.status !== "verified") {
            return res.status(401).json({ success: false, message: "Please verify your email first" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" })
        }

        const { accessToken, refreshToken } = generateTokens(user._id)

        user.refreshToken = refreshToken
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken
        })
    } catch (error) {
        console.error("Login Error:", error)
        return res.status(500).json({ success: false, message: "Server error during login" })
    }
}


// USER LOGOUT HANDLER
const logoutUser = async (req, res) => {
    try {
        const { userId, tokenType } = req.user

        if (!userId || tokenType !== "refresh") {
            return res.status(401).json({ success: false, message: "Unauthorized request" })
        }

        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } })

        return res.status(200).json({ success: true, message: "User logged out" })
    } catch (error) {
        console.error("Logout Error:", error)
        return res.status(500).json({ success: false, message: "Server error during logout" })
    }
}


// REFRESH ACCESS TOKEN
const refreshAccessToken = async(req, res) => {
    try {

        const { userId, tokenType } = req.user;

        if (!userId || tokenType !== "refresh") {
            return res.status(401).json({ success: false, message: "Unauthorized Request" })
        }

        // Token Generation
        const { accessToken, refreshToken } = generateTokens(userId)

        await User.findByIdAndUpdate(
            userId,
            {
                refreshToken
            },{
                new: true
            }
        )

        return res.status(200).json({ success: true, message: "Access and Refresh Token Update Success", accessToken, refreshToken })

    } catch (error) {

        return res.status(500).json({ success: false, message: "Error! Cannot Update Access and Refresh Token" })

    }
}

// UPDATE PASSWORD
const updatePassword = async (req, res) => {
    try {
        const { userId, tokenType } = req.user
        
        if (!userId || tokenType !== "access") {
            return res.status(401).json({ success: false, message: "Unauthorized request" })
        }
        
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        
        const { newPassword } = req.body
        
        const isSame = await bcrypt.compare(newPassword, user.password)
        if (isSame) {
            return res.status(400).json({ success: false, message: "New password must differ from old password" })
        }

        const hashed = await bcrypt.hash(newPassword, 10)
        user.password = hashed
        await user.save()

        return res.status(200).json({ success: true, message: "Password updated successfully" })
    } catch (error) {
        console.error("Update Password Error:", error)
        return res.status(500).json({ success: false, message: "Server error during password update" })
    }
}

// UPDATE NAME, EMAIL & PHONE
const updateUserInfo = async (req, res) => {
    try {
        const { userId, tokenType } = req.user
        
        if (!userId || tokenType !== "access") {
            return res.status(401).json({ success: false, message: "Unauthorized request" })
        }

        const { name, email, phone } = req.body
        
        if (!name && !email && !phone) {
            return res.status(400).json({ success: false, message: "At least one field (name, email, phone) must be provided for update" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        user.name = name || user.name
        user.email = email || user.email
        user.phone = phone || user.phone
        const newUserResponse = await user.save()

        return res.status(200).json({ success: true, message: "User information updated successfully", user: newUserResponse })
    } catch (error) {
        console.error("Update User Info Error:", error)
        return res.status(500).json({ success: false, message: "Server error during user information update" })
    }
}

export { registerUser, verifyUserEmail, loginUser, logoutUser, refreshAccessToken, updatePassword, updateUserInfo }