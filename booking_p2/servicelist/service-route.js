var express=require('express');
var router=express.Router();

var service_ctlr=require('./service-ctlr.js');

router.post('/createServices',service_ctlr.createServices);

router.get('/servicelist',service_ctlr.servicelist);

router.get('/ServiceDetails',service_ctlr.ServiceDetails);






module.exports=router