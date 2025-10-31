import jwt from "jsonwebtoken"

const generateToken = (userId, type, secret, expiresIn) => {
    return jwt.sign(
        { userId, tokenType: type },
        secret,
        { expiresIn, issuer: "ExhibyAPI" }
    )
}

const generateTokens = (userId) => {
    const accessToken = generateToken(
        userId,
        "access",
        process.env.JWT_GLOBAL_SECRET,
        "1h"
    )

    const refreshToken = generateToken(
        userId,
        "refresh",
        process.env.JWT_GLOBAL_SECRET,
        "30d"
    )

    return { accessToken, refreshToken }
}

export default generateTokens