import express from "express"
import verifyToken from "../middlewares/authMiddleware.js"
import upload from "../middlewares/multerMiddleware.js"
import { createLocation, getLocationByCity } from "../controllers/locationController.js"

const router = express.Router()

// Create Location
router.post("/createLocation", verifyToken, upload.array("locationImages"), createLocation)

// Get Location
router.get("/getLocation/:city", verifyToken, getLocationByCity)

export default router
