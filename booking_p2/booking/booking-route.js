var express=require('express');
var router=express.Router();

var booking_ctlr=require('./booking-ctrl.js');





router.get('/getOrganization',booking_ctlr.getOrganization);

router.get('/getServices',booking_ctlr.getServices);

router.get('/slotGeneration',booking_ctlr.slotGeneration);

router.post('/bookslot',booking_ctlr.bookslot);

router.post('/bookslotSendOTP',booking_ctlr.bookslotSendOTP);

router.post('/bookslotverifyOTP',booking_ctlr.bookslotverifyOTP);

module.exports=router;