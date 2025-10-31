import express from "express"
import verifyToken from "../middlewares/authMiddleware.js"
import {
    registerUser,
    verifyUserEmail,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    updateUserInfo
} from "../controllers/userController.js"

const router = express.Router()

router.post("/register", registerUser)
router.post("/verify", verifyUserEmail)
router.post("/login", loginUser)
router.post("/logout", verifyToken, logoutUser)
router.post("/refreshAccessToken", verifyToken, refreshAccessToken)
router.post("/updatePassword", verifyToken, updatePassword)
router.post("/updateUserInfo", verifyToken, updateUserInfo)

export default router
