const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2, 
        trim: true,
    },

    lastName: {
        type: String,
        required: true,
        minLength: 3,
        trim: true,
    },

    emailId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email");
            }
        },
    },

    password: {
        type: String,
        required: true,
        select: false,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a strong password!");
            }
        },
    },

    role: {
        type: String,
        enum: {
            values: ['user', 'owner'],
            message: `{VALUE} is invalid role`
        },
        default: 'user',
    },

    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
        if (!validator.isMobilePhone(value, "en-IN")) {
          throw new Error("Invalid phone number");
        }
      }
    },

    photoUrl: {
        type: String,
        default: "https://ohmylens.com/wp-content/uploads/2017/06/dummy-profile-pic.png",
    },
}, 
{timestamps: true});

userSchema.methods.getJWT = async function(){
    const user = this;
    const token = await jwt.sign({_id: user._id}, process.env.JWT_SECRET_KEY , {expiresIn: "7d"});
    return token;    
}

userSchema.methods.validatePass = async function(inputPass){
    const user = this;
    const hashPassword = user.password;
    const validPassword = await bcrypt.compare(inputPass,hashPassword);
    return validPassword; //returns boolean
}


const User = new mongoose.model("User",userSchema);
module.exports = User;