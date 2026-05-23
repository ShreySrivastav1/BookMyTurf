const express = require("express");
const mongoose = require("mongoose");
const Turf = require("../models/turf");
const Booking = require("../models/booking");
const {generateSlots} = require("../utils/slots");
const userAuth = require("../middlewares/auth");
const { ownerAuthn } = require("../middlewares/ownerAuth");

const bookingRouter = express.Router();

bookingRouter.get("/turfs/:turfId/availability", async (req, res) => {
  try {
    const { turfId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(turfId)) {
      return res.status(400).json({
        message: "Invalid turf id",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const requestedDate = new Date(date);

    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    const turf = await Turf.findById(turfId);

    if (!turf || turf.isActive === false) {
      return res.status(404).json({
        message: "Turf not found",
      });
    }

    const allSlots = generateSlots(
      turf.openingTime,
      turf.closingTime,
      60
    );

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      turfId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      bookingStatus: {
        $in: ["confirmed", "pending"],
      },
    }).select("startTime endTime bookingStatus");

    const bookedSlots = bookings.map((booking) => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingStatus: booking.bookingStatus,
    }));

    const availableSlots = allSlots.filter((slot) => {
      const isBooked = bookings.some((booking) => {
        return (
          booking.startTime === slot.startTime &&
          booking.endTime === slot.endTime
        );
      });

      return !isBooked;
    });

    res.status(200).json({
      message: "Availability fetched successfully",
      turf: {
        _id: turf._id,
        name: turf.name,
        openingTime: turf.openingTime,
        closingTime: turf.closingTime,
      },
      date,
      allSlots,
      bookedSlots,
      availableSlots,
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch availability",
      error: err.message,
    });
  }
});

bookingRouter.post("/booking", userAuth, async (req, res) => {

  try {
    const { turfId, bookingDate, startTime, endTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(turfId)) {
      return res.status(400).json({ message: "Invalid turfId" });
    }

    const turf = await Turf.findById(turfId);

    if (!turf || turf.isActive === false) {
      return res.status(404).json({ message: "Turf not found" });
    }

    const requestedDate = new Date(bookingDate);

    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Invalid time format" });
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    if (startMinute !== 0 || endMinute !== 0) {
        return res.status(400).json({
            message: "Booking slots must be in full hours only, like 06:00-07:00",
        });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const allSlots = generateSlots(turf.openingTime, turf.closingTime, 60);

    const requestedSlotExists = allSlots.some((slot) => {
      return slot.startTime === startTime && slot.endTime === endTime;
    });

    if (!requestedSlotExists) {
      return res.status(400).json({
        message: "Selected slot is outside turf operating hours",
      });
    }

    const existingBooking = await Booking.findOne({
      turfId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      startTime,
      endTime,
      bookingStatus: {
        $in: ["pending", "confirmed"],
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This slot is already booked",
      });
    }

    const durationInHours = endHour - startHour;
    const totalPrice = durationInHours * turf.pricePerHour;

    const booking = new Booking({
      userId: req.user._id,
      ownerId: turf.ownerId,
      turfId,
      bookingDate: requestedDate,
      startTime,
      endTime,
      totalPrice,
      bookingStatus: "pending",
      paymentStatus: "pending",
    });

    const newBooking = await booking.save();

    res.status(201).json({
      message: "Booking created successfully. Payment pending.",
      data: newBooking,
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to create booking",
      error: err.message,
    });
  }
});

bookingRouter.get("/booking/my", userAuth, async(req,res) => {
    try{
        const myBookings = await Booking.find({userId: req.user._id})
        .populate("turfId", "name city address pricePerHour photos")
        .sort({ bookingDate: -1, startTime: -1 });

        if(myBookings.length === 0){
            return res.status(200).json({
                message: "No Bookings Found!",
                data: []
            });
        }
        res.status(200).json({
            message: "Here are your bookings: ",
            data: myBookings
        });

    }catch(err){
        res.status(500).json({
            message: "Unable to find bookings",
            error: err.message,
        });
    }
});

bookingRouter.patch("/booking/cancel/:bookingId", userAuth, async(req, res) => {
    try {
        const { bookingId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                message: "Invalid booking id",
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
            });
        }

        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only cancel your own booking",
            });
        }

        if (booking.bookingStatus === "completed") {
            return res.status(400).json({
                message: "Completed booking cannot be cancelled",
            });
        }

        if (booking.bookingStatus === "cancelled") {
            return res.status(400).json({
                message: "Booking is already cancelled",
            });
        }

        const now = new Date();

        const fullBookingDateTime = new Date(booking.bookingDate);

        const [hours, minutes] = booking.startTime.split(":").map(Number);

        fullBookingDateTime.setHours(hours, minutes, 0, 0);

        // Booking already started/passed
        if (fullBookingDateTime <= now) {
            return res.status(400).json({
                message: "Booking time has already started or passed",
            });
        }

        // Cannot cancel within 1 hour of booking
        const oneHourBeforeBooking = 60 * 60 * 1000;

        if (fullBookingDateTime - now < oneHourBeforeBooking) {
            return res.status(400).json({
                message:
                    "Bookings cannot be cancelled within 1 hour of the start time",
            });
        }

        if (booking.paymentStatus === "paid") {
            booking.paymentStatus = "refund_pending";
        }

        booking.bookingStatus = "cancelled";

        const cancelledBooking = await booking.save();

        res.status(200).json({
            message: `${req.user.firstName}, your booking has been cancelled successfully!`,
            data: cancelledBooking,
        });

    } catch (err) {
        res.status(500).json({
            message: "Unable to cancel booking",
            error: err.message,
        });
    }
});

bookingRouter.get("/owner/bookings", userAuth, ownerAuthn, async(req,res) => {
    try{
        const bookings = await Booking.find({ ownerId: req.user._id })
        .populate("userId", "firstName lastName")
        .populate("turfId", "name city")
        .sort({ bookingDate: -1 });

        if(bookings.length === 0){
            return res.status(200).json({
                message: "No bookings found",
                data: []
            });
        }

        res.status(200).json({
            message: "Here are your bookings: ",
            data: bookings
        });

    }catch(err){
        res.status(500).json({
            message: "Unable to load bookings",
            error: err.message
        });

    }
});

bookingRouter.patch("/booking/:bookingId/status/:status", userAuth, ownerAuthn, async (req, res) => {
  try {
    const { bookingId, status } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking id!",
      });
    }

    const allowedStatus = ["confirmed", "completed", "cancelled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status type: " + status,
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can change status of your own turf booking only!",
      });
    }

    if (booking.bookingStatus === "completed") {
      return res.status(400).json({
        message: "Completed booking status cannot be changed",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        message: "Cancelled booking status cannot be changed",
      });
    }

    const now = new Date();

    const fullBookingEndDateTime = new Date(booking.bookingDate);
    const [hours, minutes] = booking.endTime.split(":").map(Number);
    fullBookingEndDateTime.setHours(hours, minutes, 0, 0);

    if (status === "confirmed") {
      if (booking.paymentStatus !== "paid") {
        return res.status(400).json({
          message: "Cannot confirm booking before payment is paid",
        });
      }

      booking.bookingStatus = "confirmed";
    }

    if (status === "completed") {
      if (booking.bookingStatus !== "confirmed") {
        return res.status(400).json({
          message: "Only confirmed booking can be marked as completed",
        });
      }

      if (fullBookingEndDateTime > now) {
        return res.status(400).json({
          message: "Cannot mark booking completed before the game is over",
        });
      }

      booking.bookingStatus = "completed";
    }

    if (status === "cancelled") {
      booking.bookingStatus = "cancelled";
    }

    const updatedBooking = await booking.save();

    res.status(200).json({
      message: `Booking marked as ${status}`,
      data: updatedBooking,
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to update booking status",
      error: err.message,
    });
  }
});

module.exports = bookingRouter;