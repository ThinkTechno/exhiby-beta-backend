import mongoose from "mongoose"

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    screenCount: {
        horizontal: { type: Number },
        vertical: { type: Number },
        videoWall: { type: Number }
    },
    slots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
    }],
    images: {
        type: [String]
    }
},{
    timestamps: true
})

const Location = mongoose.model("Location", locationSchema)
export default Location