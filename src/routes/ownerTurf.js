const express = require("express");
const userAuth = require("../middlewares/auth");
const {ownerAuthn}= require("../middlewares/ownerAuth");
const Turf = require("../models/turf");
const { validateEditTurfData } = require("../utils/validation");
const ownerTurfRouter = express.Router();

ownerTurfRouter.post("/turf/create", userAuth, ownerAuthn, async(req,res) => {
    try{
        const {
            name, 
            description,
            sportsSupported, 
            address, 
            city, 
            pricePerHour, 
            openingTime, 
            closingTime
        } = req.body;

      
        const turf = new Turf({
            ownerId: req.user._id, 
            name, 
            description,
            sportsSupported, 
            address, 
            city, 
            pricePerHour, 
            openingTime, 
            closingTime
        });

        const savedTurf = await turf.save();
        res.status(201).json({
            message:"New turf created successfully",
            data: savedTurf,
        });


    }catch(err){
        res.status(400).json({
            message: "Cannot create turf ",
            error: err.message
        });
    }

});

ownerTurfRouter.get("/owner/turfs", userAuth, ownerAuthn, async(req,res) => {
    try{
        const turfs = await Turf.find({ownerId: req.user._id});
        if(turfs.length === 0){
            return res.status(200).json({
                message: "You haven't registered any turf yet",
                data: []
            });
        }

        res.status(200).json({
            message: `${req.user.firstName}, here are your turf/turfs : `,
            data: turfs
        });

    }catch(err){
        res.status(500).json({
            message: "Unable to get any turf",
            error: err.message
        });

    }
});

ownerTurfRouter.patch("/turf/edit/:turfId", userAuth, ownerAuthn, async(req,res) => {
    try{
        const { turfId } = req.params;
        
        if(mongoose.Types.Objectid.isValid(turfId)){
            return res.status(400).json({
                message: "Inavlid Turf id"
            });
        }

        if(!validateEditTurfData(req)){
            return res.status(400).send("Update not allowed!");
        }
        // find turf
        const turf = await Turf.findById(turfId);

        if (!turf) {
            return res.status(404).json({
                message: "Turf not found",
            });
        }

        // ownership check
        if (turf.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can edit only your own turfs",
            });
        }

        // apply updates
        Object.keys(req.body).forEach((key) => { turf[key] = req.body[key]; });

        await turf.save();
        
        res.status(200).json({
            message: "Turf updated successfully",
            data: turf,
        });

    }catch(err){
        res.status(400).json({
            message: "Unable to update turf",
            error: err.message,
        });

    }

});

ownerTurfRouter.delete("/turf/delete/:turfId", userAuth, ownerAuthn, async(req,res) => {
    try{
        const { turfId } = req.params;

        if(mongoose.Types.Objectid.isValid(turfId)){
            return res.status(400).json({
                message: "Inavlid Turf id"
            });
        }
        
        const turf = await Turf.findById(turfId);
        if(!turf){
            return res.status(404).send("No turf found");
        }
        if(turf.ownerId.toString() !== req.user._id.toString()){
            return res.status(403).send("You can delete only your turf!")
        }
        turf.isActive = false;
        const updatedTurf = await turf.save();
        res.status(200).json({
            message: "Turf activity updated",
            data: updatedTurf
        });

    }catch(err){
        res.status(400).json({
            message: "Unable to update turf",
            error: err.message,
        });
        
    }
    
})

module.exports = ownerTurfRouter;