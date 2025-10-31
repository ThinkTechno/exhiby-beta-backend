import mongoose from "mongoose"

const personalProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    govIdFileUri: {
        type: String,
        required: true
    },
    selfieWithIdFileUri: {
        type: String,
        required: true
    },
    reviewStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reviewNote: {
        type: String,
        default: null
    }
},{
    timestamps: true
})

const PersonalProfile = mongoose.model("PersonalProfile", personalProfileSchema)
export default PersonalProfile