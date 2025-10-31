import express from "express"
import verifyToken from "../middlewares/authMiddleware.js"
import { createScreen, getScreensByLocation } from "../controllers/screenController.js"

const router = express.Router()

// Create Screen
router.post("/createScreen", verifyToken, createScreen)

// Get Screen
router.patch("/getScreen/:locationId", verifyToken, getScreensByLocation)

export default router
