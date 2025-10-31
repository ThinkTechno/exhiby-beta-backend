import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    adId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ad",
        required: true
    },
    totalCostOfSlots: {
        type: Number,
        required: true
    },
    charges: {
        type: Number,
        required: true
    },
    taxes: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true  
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
        required: true,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ["success", "pending", "failed"],
        default: "pending"
    },
    orderRefId: {
        type: String,
        required: true,
    },
    paymentRefId: {
        type: String,
        required: true,
        default: null
    },
},{
    timestamps: true
})

const Booking = mongoose.model("Booking", bookingSchema)
export default Booking