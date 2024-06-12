var express=require('express');
var router=express.Router();




var user_ctlr=require('./user-ctlr.js');

router.post('/sendOTP',user_ctlr.sendOTP);

router.post('/verifyOTP',user_ctlr.verifyOTP);

router.post('/signup',user_ctlr.signup);

router.post('/login',user_ctlr.login); 

router.post('/resetpasswordSendOTP',user_ctlr.resetpasswordSendOTP); 

router.post('/resetpasswordVerifyOTP',user_ctlr.resetpasswordVerifyOTP); 

router.post('/resetpassword',user_ctlr.resetpassword); 

router.post('/logout',user_ctlr.logout); 










module.exports=router;