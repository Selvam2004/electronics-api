 const express = require('express');
 const router = express.Router();
 const Controller = require('../Controllers/loginController');

 router.post("/registerUser",Controller.createUser);
 router.post("/login",Controller.login);
 router.get("/forgotPassword/:email",Controller.forgotPassword);
 router.post("/changePassword",Controller.changePassword);


 module.exports=router;