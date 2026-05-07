const mongoose = require("mongoose");
const User = require("./user");

const turfSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    sportsSupported: [{
        type: String,
        lowercase: true,
        enum: ["football", "cricket", "badminton", "pickleball"],
        required: true,
    }],

    description: {
        type: String,
        trim: true
    },

    address: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    pricePerHour: {
        type: Number,
        required: true
    },

    openingTime: {
        type: String,
        required: true,
    },

    closingTime: {
        type: String,
        required: true,
    },

    amenities: {
        type: [String],
    },

    photos: {
        type: [String]
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, {timestamps:true});

const Turf = new mongoose.model("Turf", turfSchema);
module.exports = Turf;