const validator = require("validator");

const validateEditProfileData = (req) => {
    const allowedUpdates = ["firstName","lastName","phoneNumber","photoUrl"];
    const isAllowedUpdates = Object.keys(req.body).every((field) => allowedUpdates.includes(field));
    return isAllowedUpdates;
}

module.exports = {validateEditProfileData};