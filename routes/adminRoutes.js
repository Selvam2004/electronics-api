const express = require('express');
const router = express.Router();
const Controller = require('../Controllers/adminController');

router.post('/updateProduct',Controller.updateProduct);
router.post('/deleteProduct',Controller.deleteProduct);
router.get('/productHistory/:_id',Controller.productHistory); 
router.post("/getProjects",Controller.getProjects);
 
module.exports=router; 