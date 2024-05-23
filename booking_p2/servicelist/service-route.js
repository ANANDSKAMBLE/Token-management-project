var express=require('express');
var router=express.Router();

var service_ctlr=require('./service-ctlr.js');

router.get('/getAllServices',service_ctlr.getAllServices);










module.exports=router