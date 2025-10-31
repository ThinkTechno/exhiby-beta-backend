import express from "express"
import verifyToken from "../middlewares/authMiddleware.js"
import upload from "../middlewares/multerMiddleware.js"
import {
  createPersonalProfile,
  reuploadPersonalProfile,
  createBusinessProfile,
  updateBusinessProfile
} from "../controllers/profileController.js"

const router = express.Router()

// Create Personal Profile
router.post(
  "/createPersonalProfile",
  verifyToken,
  upload.fields([
    { name: "govIdFile", maxCount: 1 },
    { name: "selfieWithIdFile", maxCount: 1 }
  ]),
  createPersonalProfile
)

// Reupload Personal Profile
router.post(
  "/reuploadPersonalProfile",
  verifyToken,
  upload.fields([
    { name: "govIdFile", maxCount: 1 },
    { name: "selfieWithIdFile", maxCount: 1 }
  ]),
  reuploadPersonalProfile
)

// Create Business Profile
router.post(
  "/createBusinessProfile",
  verifyToken,
  upload.fields([{ name: "letterheadFile", maxCount: 1 }]),
  createBusinessProfile
)

// Update Business Profile
router.post(
  "/updateBusinessProfile",
  verifyToken,
  updateBusinessProfile
)

export default router
