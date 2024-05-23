var express=require('express');
var router=express.Router();

var service_ctlr=require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/servicelist/service-ctlr.js');

router.get('/getAllServices',service_ctlr.getAllServices);










module.exports=router