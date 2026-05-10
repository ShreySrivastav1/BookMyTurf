const express = require("express");
const userAuth = require("../middlewares/auth");
const Turf = require("../models/turf");
const publicTurfRouter = express.Router();

publicTurfRouter.get("/public/turfs", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const turfsAvailable = await Turf.find({ isActive: true })
      .select("name city address sportsSupported description pricePerHour openingTime closingTime amenities photos")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: turfsAvailable.length ? "Available turfs :" : "No turfs available!",
      page,
      limit,
      data: turfsAvailable,
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to load turfs",
      error: err.message,
    });
  }
});

publicTurfRouter.get("/public/turf/:turfId", async(req,res) => {
    try{
        const { turfId } = req.params;
        const getTurf = await Turf.findOne({_id: turfId, isActive: true});
        if(!getTurf){
            return res.status(404).json({
                message: "Unable to find turf"
            });
        }
        res.status(200).json({
            message: "Here is your requested Turf!",
            data: getTurf
        });

    }catch(err){
        res.status(500).json({
            message: "Unable to load turf",
            error: err.message,
        });
    }
})

module.exports = publicTurfRouter;