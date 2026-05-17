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

const validateTurfData = (req, res, next) => {
  const {
    name,
    sportsSupported,
    address,
    city,
    pricePerHour,
    openingTime,
    closingTime,
  } = req.body;

  if (!name || !address || !city || !pricePerHour || !openingTime || !closingTime) {
    return res.status(400).json({
      message: "Please fill all required turf fields",
    });
  }

  if (!Array.isArray(sportsSupported) || sportsSupported.length === 0) {
    return res.status(400).json({
      message: "At least one sport must be selected",
    });
  }

  const allowedSports = ["football", "cricket", "badminton", "pickleball"];

  const invalidSports = sportsSupported.filter(
    (sport) => !allowedSports.includes(sport.toLowerCase())
  );

  if (invalidSports.length > 0) {
    return res.status(400).json({
      message: "Invalid sport type: " + invalidSports.join(", "),
    });
  }

  if (pricePerHour <= 0) {
    return res.status(400).json({
      message: "Price per hour must be greater than 0",
    });
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timeRegex.test(openingTime) || !timeRegex.test(closingTime)) {
    return res.status(400).json({
      message: "Opening time and closing time must be in HH:mm format",
    });
  }

  if (openingTime >= closingTime) {
    return res.status(400).json({
      message: "Opening time must be before closing time",
    });
  }

  next();
};


module.exports = {validateEditProfileData , validateEditTurfData, validateSignUpData, validateTurfData};