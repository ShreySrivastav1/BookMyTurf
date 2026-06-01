require("dotenv").config();
const express = require("express");
const app = express();
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRou");
const profileRouter = require("./routes/profileRou");
const ownerTurfRouter = require("./routes/ownerTurf");
const publicTurfRouter = require("./routes/publicTurf");
const bookingRouter = require("./routes/bookingRou");
const cors = require("cors");
const paymentRouter = require("./routes/paymentRou");

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://13.127.251.76"
    ],
    credentials: true
}));

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",ownerTurfRouter);
app.use("/",publicTurfRouter);
app.use("/",bookingRouter);
app.use("/",paymentRouter);

connectDb().then(() => {
    console.log("Successfully connected to Database");
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
})
}).catch((err) => {
    console.log("Unable to connect to DB");
    console.error(err.message);

});

