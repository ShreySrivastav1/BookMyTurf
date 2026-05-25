const express = require("express");
const userAuth = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const crypto = require("crypto");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId).populate("turfId");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not Allowed" });
        }

        const amount = booking.totalPrice;

        //create order
        const order = await razorpayInstance.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `booking_${booking._id}`,
            notes: {
                bookingId: booking._id.toString(),
                userId: req.user._id.toString(),
                turfId: booking.turfId._id.toString(),
            },
        });


        //save the order
        await Payment.create({
            userId: req.user._id,
            bookingId: booking._id,
            razorpayOrderId: order.id,
            amount,
            currency: "INR",
            paymentStatus: "created",
        });


        //send orderId to frontend
        res.status(200).json({
            message: "Order created successfully: ",
            data: order,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        res.status(500).json({
            message: "Unable to create order",
            error: err.message
        })

    }
});

paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
    try {
        const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid Payment Signature" });
        }

        await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                paymentStatus: "paid"
            }
        );

        await Booking.findByIdAndUpdate(bookingId,
            {
                bookingStatus: "confirmed",
                paymentStatus: "paid",
            }
        );

        res.status(200).json({message: "Payment Verified Successfully!"});


    } catch (err) {
        res.status(500).json({
            message: "Payment Verification Failed!",
            error: err.message
        });

    }
})

module.exports = paymentRouter;