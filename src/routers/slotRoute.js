import express from "express"
import verifyToken from "../middlewares/authMiddleware.js"
import { getAvailableSlots } from "../controllers/slotController.js"

const router = express.Router()

// Get Slot
router.get("/getAvailableSlots", verifyToken, getAvailableSlots)

export default router