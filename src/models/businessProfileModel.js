import mongoose from "mongoose"
import { businessProfileEnums } from "../utils/constant.js"

const businessProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    businessName: {
        type: String,
        required: true,
        unique: true
    },
    businessEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        sparse: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    businessType: {
        type: String,
        enum: businessProfileEnums.businessTypeEnum,
        required: true
    },
    industryType: {
        type: String,
        enum: businessProfileEnums.industryTypeEnum,
        required: true
    },
    website: {
        type: String,
        default: null
    },
    letterheadFileUri: {
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

const BusinessProfile = mongoose.model("BusinessProfile", businessProfileSchema)
export default BusinessProfile