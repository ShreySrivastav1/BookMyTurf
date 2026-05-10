const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password, phoneNumber } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  } else if (!validator.isMobilePhone(phoneNumber, "en-IN")) {
    throw new Error("Invalid phone number");
}
};

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

module.exports = {validateEditProfileData , validateEditTurfData, validateSignUpData};