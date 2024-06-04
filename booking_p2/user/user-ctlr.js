var express = require('express');
var user_ctlr = express.Router();
var axios = require('axios');
const crypto = require('crypto');
var data = require('../db.js');
var mail = require('../mailSender.js')
var configmail = require('../config.json')
var moment = require('moment');;



user_ctlr.sendOTP = function (req, res, next) {

    const { emailID } = req.body;
    
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailID)) {

        var checkEmailExisistance=`call tmm_user_get_checkEmailExisistance(?)`;
        data.query(checkEmailExisistance,[emailID],(err,result)=>{
            if(err){
                res.status(400).json({
                    "status":false,
                    "message":"error occured :"+ err
                })
            }
            else{
                switch(result[0][0].Res){
                    case "emailExist":
                        res.status(400).json({
                            "status":false,
                            "message":"email already existed!"
                        })
                        return;
                    case "emailNotExist":
                        const randomOTP = Math.floor(1000 + Math.random() * 9000); //GENERATE 4-digit OTP
                        var mailDetails = {

                            from: configmail.emailCredentials.auth.user,
                            to: emailID,
                            subject: 'OTP for email verification',
                            text: `Your OTP is: ${randomOTP} valid for 10 minutes`
                        };



                        mail.sendMail(mailDetails, function (error, info) {
                            if (error) {
                                res.status(400).json(
                                    {
                                        "status": "false",
                                        "message": error
                                    });
                            }
                            else {
                                var sendOTPQuery = `call tmm_save_user_sendOTP(?,?)`;
                                data.query(sendOTPQuery, [emailID, randomOTP],(err,result)=>{
                                    if(err){
                                        res.status(400).json({
                                            "status":false,
                                            "message":"error occured :"+ err
                                        })
                                    }
                                    else{
                                        res.status(200).json(
                                            {
                                                "status": "true",
                                                "message": "OTP sent successfully!",
                                                "data":{
                                                    mail :emailID
                                                }
                                            });

                                    }

                                })
                                
                            }
                        });
                        return;
                    
                    default :
                        res.status(400).json(
                            {
                                "status": "false",
                                "message": "server error occured"
                            });

                }

            }

        })
        
        
    }
    else {
        res.status(400).json(
            {
                "status": "false",
                "message": "enter proper mailID"
            });
    }
};




//verify OTP
user_ctlr.verifyOTP = function (req, res, next) {
    const { emailID, OTP } = req.body;

    
    if (OTP.length == 4) {
        var verifyOTP = `call tmm_save_user_verifyOTP(?,?)`;
        data.query(verifyOTP, [emailID, OTP], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured : " + err

                })
            }
            else {
                var value = result[0][0].Res;
                switch (value) {
                    case 'not-verified':
                        res.status(400).json({
                            "status": "false",
                            "message": "otp is not verified"

                        })
                        return;

                    case 'verified':
                        res.status(200).json({
                            "status": "true",
                            "message": "otp verified successfully",
                            "data":{
                                mail:emailID
                            }

                        })
                        return;

                    default:
                        res.status(500).json({
                            "status": "false",
                            "message": "server error occured"
                        })

                }

            }
        })
    }
    else {
        res.status(400).json({
            "status": "false",
            "message": "enter proper OTP"

        })

    }


}






//password encryption
function hashPassword(password) {
    return crypto.createHash('sha512').update(password).digest('hex');
}



function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}




function isValidPassword(password) {
    return password.length >= 5;
}





function dataValidationFunction0({ first_name, emailID, mobile_number, password, user_type, organization_name, organization_profile, time_zone_id, idRequired }) {
    let errors = [];

    if (first_name.length < 3) {
        errors.push("First name must be at least 3 characters long.");
    }
    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (mobile_number.length !== 10) {
        errors.push("Mobile number must be exactly 10 digits long.");
    }
    if (!isValidPassword(password)) {
        errors.push("Password must be at least 5 characters long.");
    }
    if (![0, 1].includes(user_type)) {
        errors.push("User type must be either 0 or 1.");
    }
    if (organization_name !== null && organization_name.length <= 3) {
        errors.push("Organization name must be more than 3 characters long.");
    }
    if (organization_profile !== null && organization_profile.length <= 5) {
        errors.push("Organization profile must be more than 5 characters long.");
    }
    if (time_zone_id.length < 5) {
        errors.push("Time zone ID must be at least 5 characters long.");
    }
    if (![0, 1, null].includes(idRequired)) {
        errors.push("ID required must be either 0, 1, or null.");
    }

    return errors;
}





user_ctlr.signup = function (req, res, next) {
    const {
        first_name, 
        last_name, 
        emailID, 
        mobile_isd, 
        mobile_number, 
        password, 
        user_type,
        organization_name, 
        organization_profile, 
        image, 
        time_zone_id, 
        idRequired
    } = req.body;

    const errors = dataValidationFunction0({
        first_name, emailID, mobile_number, password, user_type, 
        organization_name, organization_profile, time_zone_id, idRequired
    });

    if (errors.length === 0) {
        const hashedPassword = hashPassword(password);

        const register = `call tmm_save_user_signup(?,?,?,?,?,?,?,?,?,?,?,?)`;

        data.query(register, [
            first_name, last_name, emailID, mobile_isd, mobile_number, hashedPassword,
            user_type, organization_name, organization_profile, image, time_zone_id, idRequired
        ], (err, result) => {
            if (err) {
                res.status(400).json({
                    status: "false",
                    message: "Error occurred: " + err
                });
                return;
            }
            
            const value1 = result[0][0].Res;
            switch (value1) {
                case "registered":
                    res.status(200).json({
                        status: "true",
                        message: "Registered successfully!"
                    });
                    return;
                
                default:
                    res.status(500).json({
                        status: "false",
                        message: "Server error occurred"
                    });
                    return;
            }
        });
    } else {
        res.status(400).json({
            status: "false",
            message: "please enter proper details: " + errors.join(", ")
        });
    }
}







function dataValidationFunction1({emailID,password,user_type}){
    const errors=[];

    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (!isValidPassword(password)) {
        errors.push("Password must be at least 5 characters long.");
    }
    if (![0, 1].includes(user_type)) {
        errors.push("User type must be either 0 or 1.");
    }
    return errors;    

}








//login
user_ctlr.login = function (req, res, next) {

    const { emailID, password,user_type } = req.body;
    const errors=dataValidationFunction1({emailID,password,user_type});

    if(errors.length===0){
        const hashedPassword=hashPassword(password);
        var loginCheck = `call tmm_save_user_login(?,?,?)`;


        data.query(loginCheck, [emailID, hashedPassword,user_type], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured:" + err
                })
            }
            else {
                console.log(result);
                var value2 = result[0][0].Res;
                switch (value2) {
                    case "loggedIn":
                        res.status(200).json({
                            "status": "true",
                            "message": "login successfull!!",
                            "data":{
                                uuid:result[0][0].UUID,
                                firstName:result[0][0].first_name,
                                lastName:result[0][0].last_name,
                                emailID:result[0][0].emailID,
                                mobileISD:result[0][0].mobile_isd,
                                mobileNumber:result[0][0].mobile_number,
                                organizationName:result[0][0].organization_name,
                                organizationProfile:result[0][0].organization_profile,
                                image:result[0][0].image,
                            }
                        })
                        return;

                    case "failedLogIn":
                        res.status(200).json({
                            "status": "false",
                            "message": "login failed! check credentials"
                        })
                        return;

                    default:
                        res.status(500).json({
                            "status": "false",
                            "message": "server side error occured"
                        })
                        return;
                }

            }
        })

    }
    else {
        res.status(400).json({
            "status": "false",
            "message": "please enter proper details :"+ errors.join(", ")
        })
    }

}






function dataValidationFunction2(emailID){
    let errors=[];

    if (!(isValidEmail(emailID))) {
        errors.push("Invalid email format.");
    }
    console.log(errors);
    return errors;

}




user_ctlr.resetpasswordSendOTP=function (req,res,next){
    const {emailID}=req.body;

    const error=dataValidationFunction2(emailID);

    if(error.length==0){

        var checkEmailExisistance=`call tmm_user_get_checkEmailExisistance(?)`;

        data.query(checkEmailExisistance,[emailID],(err,result)=>{
            if(err){
                res.status(400).json({
                    "status":false,
                    "message":"error occured :"+ err
                })
            }
            else{
                switch(result[0][0].Res){
                    case "emailExist":
                        const randomOTP = Math.floor(1000 + Math.random() * 9000); //GENERATE 4-digit OTP
                        var mailDetails = {

                            from: configmail.emailCredentials.auth.user,
                            to: emailID,
                            subject: 'OTP for update password ',
                            text: `Your OTP is: ${randomOTP} valid for 10 minutes`
                        };

                        mail.sendMail(mailDetails, function (error, info) {
                            if (error) {
                                res.status(400).json(
                                    {
                                        "status": "false",
                                        "message": error
                                    });
                            }
                            else {
                                var sendOTPQuery = `call tmm_save_user_sendOTP(?,?)`;
                                data.query(sendOTPQuery, [emailID, randomOTP])
                                res.status(200).json(
                                    {
                                        "status": "true",
                                        "message": "OTP sent successfully!",
                                        "data":{
                                            mail :emailID
                                        }
                                    });
                            }
                        });
                        return;
                        
                        
                    case "emailNotExist":
                        res.status(400).json(
                            {
                                "status": "false",
                                "message": "email not exist!"
                            });
                            return;
                    
                    default :
                        res.status(400).json(
                            {
                                "status": "false",
                                "message": "server error occured"
                            });
                            return;

                }

            }

        })

    }
    else{
        res.status(400).json({
            "status":false,
            "message":"enter valid details:" +error.join(", ")
        })
    }
}





function dataValidationFunction3({emailID,OTP}){

    let errors=[];

    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (OTP.length!==4){
        errors.push("Invalid OTP!");
    }
    return errors;

}






user_ctlr.resetpasswordVerifyOTP=function(req,res,next){
    const {emailID,OTP}=req.body;

    const error=dataValidationFunction3({emailID,OTP});

    if(error.length==0){


        var verifyOTP = `call tmm_save_user_verifyOTP(?,?)`;
        data.query(verifyOTP, [emailID, OTP], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured : " + err

                })
            }
            else {
                var value = result[0][0].Res;
                switch (value) {
                    case 'not-verified':
                        res.status(400).json({
                            "status": "false",
                            "message": "otp is not verified"

                        })
                        return;

                    case 'verified':
                        res.status(200).json({
                            "status": "true",
                            "message": "otp verified successfully",
                            "data":{
                                mail:emailID
                            }

                        })
                        return;

                    default:
                        res.status(500).json({
                            "status": "false",
                            "message": "server error occured"
                        })

                }

            }
        })

    }
    else{
        res.status(400).json({
            "status":false,
            "message":"enter valid details"+ error.join(", ")
        })
    }
}






function dataValidationFunction4({emailID,password,reEnterPassword}){
    let errors=[];

    if (!isValidEmail(emailID)) {
        errors.push("Invalid email format.");
    }
    if (!isValidPassword(password)) {
        errors.push("Password must be at least 5 characters long.");
    }
    if(password !==reEnterPassword){
        errors.push("password not matched");
    }
    return errors;
}







user_ctlr.resetpassword=function(req,res,next){
    const{emailID,password,reEnterPassword}=req.body;

    const error=dataValidationFunction4({emailID,password,reEnterPassword});

    if(error.length===0){
        const hashedPassword=hashPassword(password);
        var updatepassword=`call tmd_user_save_updatePassword(?,?)`;
        data.query(updatepassword,[emailID,hashedPassword],(err,result)=>{
            if(err){
                res.status(400).json({
                    "status":false,
                    "message":"error occured :"+err
                })
            }
            else{
                switch(result[0][0].Res){
                    case "resetedPassword":
                        res.status(200).json({
                            "status":true,
                            "message":"password reseted!"
                        })
                        return;
                    
                        case "notResetedPassword":
                            res.status(400).json({
                                "status":false,
                                "message":"unable to reset password!"
                            })
                            return;
                        
                        default:
                            res.status(500).json({
                                "status":false,
                                "message":"server side error occured!"
                            })
                            return;

                }
            }
            
        })

    }
    else{
        res.status(400).json({
            "status":false,
            "message":"enter valid details: "+ error.join(", ")
        })
    }
}





user_ctlr.logout = function (req, res, next) {
    const { uuid } = req.body;

    if (uuid.length >= 4) {
        var logout = 'call tmm_save_user_logout(?)'; //logout block
        data.query(logout, [uuid], (err, result) => {

            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured" + err
                })
            }
            else {
                console.log(result);
                var value3 = result[0][0].Res;
                
                switch (value3) {
                    case 'loggedOut':
                        res.status(400).json({
                            "status": "true",
                            "message": "logged out successfully"
                        })
                        return;

                    case 'invalidUUIDFound':
                        res.status(400).json({
                            "status": "false",
                            "message": "no userId found"
                        })
                        return;

                    default:
                        res.status(500).json({
                            "status": "false",
                            "message": "server error occured"
                        })
                        return;

                }

            }


        })
    }
    else{
        res.status(400).json({
            "status":false,
            "message":"enter proper UUID"
        })
    }

}





module.exports = user_ctlr;