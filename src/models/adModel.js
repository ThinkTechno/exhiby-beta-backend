import mongoose from "mongoose"

const adSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    adMediaUri: {
        type: String,
        required: true
    },
    adMediaType: {
        type: String,
        required: true
    },
    adMediaDuration: {
        type: Number,
        default: null
    },
    adStartDate: {
        type: Date,
        required: true,
    },
    adDuration: {
        type: String,
        required: true,
    },
    locations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    }],
    slots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        required: true
    }],
    status: {
        type: String,
        enum: ["under_review", "approved", "rejected", "queued", "live", "completed", "reuploaded"],
        default: "under_review"
    },
    statusHistory: {
        type: [{
            status: { type: String, required: true },
            time: { type: Date, required: true }
        }],
        default: []
    },
    rejectionReason: {
        type: String,
        default: null
    }
},{
    timestamps: true
})

const Ad = mongoose.model("Ad", adSchema)
export default Ad