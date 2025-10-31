import mongoose from "mongoose"

const screenSchema = new mongoose.Schema({
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
    screenAddress: {
        type: String,
        required: true
    },
    screenType: {
        type: String,
        enum: ["horizontal", "vertical", "videoWall"],
        required: true
    },
    screenDimension: {
        type: String,
        required: true
    },
    screenResolution: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

const Screen = mongoose.model("Screen", screenSchema)
export default Screen