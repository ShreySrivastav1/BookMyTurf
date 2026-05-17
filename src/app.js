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
const cors = require("cors")

app.use(express.json());
app.use(cookieParser());
app.use(
    cors(
        {
            origin:"http://localhost:5173",
            credentials: true
        }
    )
);

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",ownerTurfRouter);
app.use("/",publicTurfRouter);
app.use("/",bookingRouter);

connectDb().then(() => {
    console.log("Successfully connected to Database");
    app.listen(7777, () => {
        console.log("Server is listening on port 7777");
})
}).catch((err) => {
    console.log("Unable to connect to DB");
    console.error(err.message);

});

