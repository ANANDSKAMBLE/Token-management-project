var express=require('express');
var router=express.Router();

var service_ctlr=require('./service-ctlr.js');

router.post('/createServices',service_ctlr.createServices);

router.post('/workingHours',service_ctlr.workingHours);

router.post('/addHolidays',service_ctlr.addHolidays);

router.get('/servicelist',service_ctlr.servicelist);

router.get('/ServiceDetails',service_ctlr.ServiceDetails);

router.post('/updateServiceDetails',service_ctlr.updateServiceDetails);





module.exports=router