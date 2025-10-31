import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    },
    verificationData: {
        status: { type: String, enum: ["pending", "verified"], default: "pending" },
        code: { type: String, default: null },
        expiresAt: { type: Date, default: null }
    },
    accountType: {
        type: String,
        enum: ["personal", "business"],
        default: "personal"
    },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active"
    }
},{
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this.toObject()    // Converts the document to a plain object
    delete user.password            // Remove password
    delete user.verificationData    // Remove verificationData
    delete user.refreshToken        // Remove refreshToken
    delete user.__v
    return user
}

const User = mongoose.model("User", userSchema)
export default User