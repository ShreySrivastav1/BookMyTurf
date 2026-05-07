const express = require("express");
const userAuth = require("../middlewares/auth");
const { validateEditProfileData } = require("../middlewares/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth , async(req,res) => {
    try{
        const user = req.user;
        res.send(user);
    }catch(err){
        res.status(400).send("Cannot view profile : " + err.message);
    }    
});

profileRouter.patch("/profile/edit", userAuth, async(req,res) => {
    try{
        if(!validateEditProfileData(req)){
            return res.status(400).send("Update not allowed!");
        }
        const loggedInUser = req.user;
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
        await loggedInUser.save();
        res.json({
            message:`${loggedInUser.firstName}, your profile has been successfully updated!`,
            data: loggedInUser
        });

    }catch(err){
        res.status(400).send("Unable to edit : " + err.message);
    }
});

profileRouter.patch("/profile/become-owner", userAuth, async(req,res) => {
    try{
        const loggedInUser = req.user;

        if(loggedInUser.role === "owner"){
            res.status(400).send("You are already a owner!");
        }

        loggedInUser.role = "owner";
        await loggedInUser.save();
        res.json({
            message: "You are now a turf owner!",
            data: loggedInUser,
        })


    }catch(err){
        res.status(400).send("Unable to edit role : " + err.message);
    }
})

profileRouter.patch("/profile/updatePassword", userAuth, async (req, res) => {
  try {
    const { oldPassword, password } = req.body;

    if (!oldPassword || !password) {
      throw new Error("Old password and new password are required");
    }

    if (!validator.isStrongPassword(password)) {
      throw new Error("Enter a strong password");
    }

    const user = await User.findById(req.user._id).select("+password");

    const validPassword = await user.validatePass(oldPassword);

    if (!validPassword) {
      throw new Error("Old password is incorrect!");
    }

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (isSamePassword) {
      throw new Error("New password cannot be same as old password");
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.send(`${user.firstName}, your password has been successfully updated!`);
  } catch (err) {
    res.status(400).send("Unable to update: " + err.message);
  }
});

module.exports = profileRouter;