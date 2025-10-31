import mongoose from "mongoose"
import { staffEnum } from "../utils/constant.js"

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    dateOfJoining: {
        type: Date,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    department: {
        type: String,
        enum: staffEnum.departments,
        required: true
    },
    govtIdUrl: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

const Staff = mongoose.model("Staff", staffSchema)