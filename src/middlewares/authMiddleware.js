import jwt from "jsonwebtoken"

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized request: Missing or malformed token" })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_GLOBAL_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        console.error("JWT verification failed:", error.message)
        return res.status(403).json({ message: "Token is invalid or expired" })
    }
}

export default verifyToken
