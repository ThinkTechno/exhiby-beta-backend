// External Library Imports
import express from "express"
import cors from "cors"

const app = express()

// External Middleware Configurations
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Global Error Handlers
app.use((err, req, res, next) => {
    console.error("Global Error:", err)
    res.status(500).json({ success: false, message: "Internal Server Error" })
})

// Global Requests Handlers
app.get("/", (req, res) => {
    res.send("Welcome to Exhiby Server")
})

// Routes Imports
import userRoute from "./routers/userRoute.js"
import profileRoute from "./routers/profileRoute.js"
import adRoute from "./routers/adRoute.js"
import bookingRoute from "./routers/bookingRoute.js"
import locationRoute from "./routers/locationRoute.js"
import screenRoute from "./routers/screenRoute.js"
import slotRoute from "./routers/slotRoute.js"

// Routes Declarations
app.use("/api/v1/user", userRoute)
app.use("/api/v1/profile", profileRoute)
app.use("/api/v1/ad", adRoute)
app.use("/api/v1/booking", bookingRoute)
app.use("/api/v1/location", locationRoute)
app.use("/api/v1/screen", screenRoute)
app.use("/api/v1/slot", slotRoute)

export default app