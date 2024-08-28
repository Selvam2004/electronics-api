const express = require('express');
const router = express.Router();
const Controller = require('../Controllers/adminController');

router.post('/updateProduct',Controller.updateProduct);
router.post('/deleteProduct',Controller.deleteProduct);
router.get('/productHistory/:_id',Controller.productHistory); 
router.get("/getProjects",Controller.getProjects);
router.get("/getProjectbyId/:id",Controller.getProjectbyId);
 
module.exports=router; 