var express=require('express');
var router=express.Router();

var booking_ctlr=require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/booking/booking-ctrl.js');

router.get('/bookSlot',booking_ctlr.bookSlot);










module.exports=router;