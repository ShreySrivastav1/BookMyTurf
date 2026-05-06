const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1"]);

const mongoose = require("mongoose");

const connectDb = async() => {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET);
};

module.exports = connectDb;




