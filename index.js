const express = require('express')
const app = express();
const mongoose = require('mongoose');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const dotenv = require('dotenv');
dotenv.config({ path: './.env' }); 

const PORT=process.env.port || 3500;

app.use(cors({
    origin:["http://localhost:3000"],
    methods:["GET","POST"],
    credentials:true
  }));
app.use(cookieParser());
app.use(express.json());

const url=process.env.MONGO_URL;
mongoose.connect(url); 

app.use("/",require('./routes/loginRoutes'));  
app.use("/home",require('./routes/homeRoutes'));  

app.listen(PORT,()=>{
    console.log('app is listening');
})