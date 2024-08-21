const express = require('express');
const router = express.Router();
const HomeController = require('../Controllers/userController');
const Controller = require('../Controllers/itemController');

router.get("/userData",HomeController.userData);
router.post("/addItems",Controller.addItems);
router.get("/getItems",Controller.getItems);
router.post("/claimItems",Controller.claimItems);

module.exports=router;