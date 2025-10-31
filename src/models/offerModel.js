import mongoose from "mongoose"

const offerSchema = new mongoose.Schema({

},{
    timestamps: true
})

const Offer = mongoose.Model("Offer", offerSchema)
export default Offer