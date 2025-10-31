import express from "express"
import verifyToken from "../middlewares/authMiddleware.js"
import upload from "../middlewares/multerMiddleware.js"
import { createAd, reuploadAd, getAdInfo } from "../controllers/adController.js"

const router = express.Router()

// Create Ad
router.post("/createAd", verifyToken, upload.single("adMedia"), createAd)

// Reupload Rejected Ad
router.patch("/reuploadAd/:adId", verifyToken, upload.single("adMedia"), reuploadAd)

// Get Ad Info
router.get("/getAdInfo/:adId", verifyToken, getAdInfo)

export default router
