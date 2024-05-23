var express=require('express');
var router=express.Router();

var booking_ctlr=require('./booking-ctrl.js');

router.get('/bookSlot',booking_ctlr.bookSlot);










module.exports=router;