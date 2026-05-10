const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();

authRouter.post("/signUp", async(req,res) => {
    try{
        validateSignUpData(req);

        const { firstName, lastName, emailId, password, phoneNumber} = req.body;
        const passwordHash = await bcrypt.hash(password,10);

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            phoneNumber
        });
        const savedUser = await user.save();

        const token = await savedUser.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.json({
            message: "Signed up successfully!",
            data: savedUser
        });

    }catch(err){
        res.status(400).send("Unable to sign Up! : " + err.message);
    }
    
});

authRouter.post("/login", async(req,res) => {
    try{
        const {emailId,password} = req.body;
        const user = await User.findOne({ emailId }).select("+password");
        if(!user){
            throw new Error("Invalid Credentials");
        }
        const validPassword = await user.validatePass(password);
        if(validPassword){
            const token = await user.getJWT();
            res.cookie("token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            res.json({ 
                message: "Logged in Successfully!",
                data: user
            })
        }
        else{
            throw new Error("Invalid Credentials");
        }

    }catch(err){
        res.status(400).send("Unable to log in! : " + err.message);
    }
});

authRouter.post("/logout", async(req,res) => {
    try{
        res.cookie("token", null , { expires: new Date(Date.now()) });
        res.send("Logeged Out Successfully!");
    }catch(err){
        res.status(400).send("Unable to Logout! :" + err.message );
    }
})

module.exports = authRouter;