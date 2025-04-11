const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config()

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.get("/", (req,res) =>{
    res.send('Food share verver is running.....')
})
app.listen(port, () =>{
    console.log(`food share server is running on port: ${port}`)
})











