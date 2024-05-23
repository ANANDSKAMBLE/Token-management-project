var express=require('express');
var router=express.Router();

var user_ctlr=require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/user/user-ctlr.js')

router.post('/sendOTP',user_ctlr.sendOTP);

router.post('/verifyOTP',user_ctlr.verifyOTP);

router.post('/signup',user_ctlr.signup);

router.post('/login',user_ctlr.login); 

router.post('/logout',user_ctlr.logout); 










module.exports=router;