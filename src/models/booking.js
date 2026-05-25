const mongoose = require("mongoose");
const User = require("./user");
const Turf = require("./turf");
const validator = require("validator");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    turfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Turf",
        required:  true,
    },

    bookingDate: {
        type: Date,
        required: true,
        validate(value){
            if (value < new Date().setHours(0, 0, 0, 0)) {
                throw new Error("Booking date cannot be in the past");
            }
        },
    },

    startTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:mm format"],
    },

    endTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:mm format"],
    },

    totalPrice: {
        type: Number,
        required: true,
        min: [0, "Total price cannot be negative"],
    },

    bookingStatus: {
        type: String,
        enum: {
            values: ["pending", "confirmed", "cancelled", "completed"],
            message: `{VALUE} is invalid status`
        },
        default: "pending",
    },

    paymentStatus: {
        type: String,
        enum: {
            values: ["pending", "paid", "failed", "refund_pending", "refunded"],
            message: `{VALUE} is invalid status`
        },
        default: "pending",
    },


},{ timestamps: true});

bookingSchema.index(
  { turfId: 1, bookingDate: 1, startTime: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingStatus: { $in: ["pending", "confirmed"] }
    }
  }
);


const Booking = new mongoose.model("Booking", bookingSchema);

module.exports = Booking;