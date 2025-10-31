import express from "express"
import verifyToken from "../middlewares/authMiddleware.js"
import { createBooking, verifyBooking } from "../controllers/bookingController.js"

const router = express.Router()

router.post("/createBooking", verifyToken, createBooking)
router.post("/verifyBooking", verifyToken, verifyBooking)

export default router