import mongoose from "mongoose"

const slotSchema = new mongoose.Schema({
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    window : {
        type: String, // e.g., "09-10"
        required: true
    },
    shift: {
        type: String,
        enum: ["standard", "prime"],
        required: true
    },
    bookedAds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ad",     
    }],
    isAvailable: {
        type: Boolean,
        required: true,
        default: true
    }
},{
    timestamps: true
})

// Post-save hook to automatically update isAvailable when there are 5 booked ads
slotSchema.pre('save', function(next) {
  if (this.bookedAds.length >= 5) {
    this.isAvailable = false
  } else {
    this.isAvailable = true
  }
  next()
})

// Index to ensure uniqueness of slots per location and date
slotSchema.index({ locationId: 1, date: 1 });

// Custom validation for bookedAds array
slotSchema.path('bookedAds').validate(function(value) {
    return value.length <= 5
}, 'You can only add a maximum of 5 ads to this slot.')

const Slot = mongoose.model("Slot", slotSchema)
export default Slot