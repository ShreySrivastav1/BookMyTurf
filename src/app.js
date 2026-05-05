const express = require("express");

const app = express();

app.use("/", (req,res) => {
    res.send("hi Shrey");
})


app.listen(7777, () => {
    console.log("Server is listening on port 7777");
})
