const express = require('express');
const router = express.Router();
const Controller = require('../Controllers/adminController');

router.post('/updateProduct',Controller.updateProduct);
router.post('/deleteProduct',Controller.deleteProduct);

module.exports=router;