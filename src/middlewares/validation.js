const validator = require("validator");

const validateEditProfileData = (req) => {
    const allowedUpdates = ["firstName","lastName","phoneNumber","photoUrl"];
    const isAllowedUpdates = Object.keys(req.body).every((field) => allowedUpdates.includes(field));
    return isAllowedUpdates;
}


const validateEditTurfData = (req) => {
    const allowedUpdates = [
        "name",
        "description",
        "sportsSupported",
        "address",
        "city",
        "pricePerHour",
        "openingTime",
        "closingTime",
        "amenities",
        "photos",
      ];

      const isUpdateAllowed = Object.keys(req.body).every((field) =>allowedUpdates.includes(field));
      return isUpdateAllowed;
}

module.exports = {validateEditProfileData , validateEditTurfData};