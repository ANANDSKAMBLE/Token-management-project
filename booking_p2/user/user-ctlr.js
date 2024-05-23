var express = require('express');
var user_ctlr = express.Router();
var axios = require('axios');

const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha512').update(password).digest('hex');
}
var data = require('../db.js');
var mail = require('../mailSender.js')
var configmail = require('../config.json')



user_ctlr.sendOTP = function (req, res, next) {

    const { emailID } = req.body;
    if (emailID.length > 5) {
        const randomOTP = Math.floor(Math.random() * 10000);
        var mailDetails = {

            from: configmail.emailCredentials.auth.user,
            to: emailID,
            subject: 'OTP for login verification',
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
                var sendOTPQuery = `call insertInOTPTable(?,?)`;
                data.query(sendOTPQuery, [emailID, randomOTP])
                res.status(200).json(
                    {
                        "status": "true",
                        "message": "OTP sent successfully!"
                    });
            }
        });
    }
    else {
        res.status(400).json(
            {
                "status": "false",
                "message": "enter proper credentials"
            });
    }
};





user_ctlr.verifyOTP = function (req, res, next) {
    const { emailID, OTP } = req.body;
    if (emailID.length > 5 && OTP.length == 4) {
        var verifyOTP = `call verifyOTP(?,?)`;
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
                            "message": "otp verified successfully"

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
            "message": "enter proper credentials"

        })

    }


}


















function registercheck(first_name, last_name, emailID, mobile_isd, mobile_number, password,
    user_type, organization_name, organization_profile, image, time_zone_id, idRequired) {
    if (first_name.length >= 3 && emailID.length > 5 && mobile_number.length == 10 && password.length >= 5 &&
        (user_type == 0 | user_type == 1) && (organization_name == null || organization_name.length > 3) &&
        (organization_profile == null || organization_profile.length > 5) && time_zone_id.length >= 5 &&
        (idRequired == 0 || idRequired == 1 || idRequired == null))
        return true;
    else {
        return false;
    }
}

user_ctlr.signup = function (req, res, next) {
    const { first_name,
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

    if (registercheck(first_name, last_name, emailID, mobile_isd, mobile_number, password, user_type,
        organization_name, organization_profile, image, time_zone_id, idRequired)) {

        const hashedpassword = hashPassword(password);
        console.log(1);
        var register = `call registerUser(?,?,?,?,?,?,?,?,?,?,?,?)`;
        console.log(2);

        data.query(register, [
            first_name,
            last_name,
            emailID,
            mobile_isd,
            mobile_number,
            hashedpassword,
            user_type,
            organization_name,
            organization_profile,
            image,
            time_zone_id,
            idRequired
        ], (err, result) => {
            if (err) {
                console.log(3);

                res.status(400).json({
                    "status": "false",
                    "message": "error occured : " + err

                })

            }
            else {
                console.log(4);
                var value1 = result[0][0].Res;
                console.log(value1);
                switch (value1) {
                    case "registered":
                        res.status(200).json({
                            "status": "true",
                            "message": "registered successfully"

                        })
                        return;

                    case "failedToRegister":
                        res.status(200).json({
                            "status": "false",
                            "message": "failed to register! Please enter proper mailID"

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
    else {
        res.status(400).json({
            "status": "false",
            "message": "enter proper details"
        })
    }
}






user_ctlr.login = function (req, res, next) {

    const { emailID, password } = req.body;

    if (emailID.length > 5 && password.length >= 5) {

        var loginCheck = `call loginCheck(?,?)`;
        data.query(loginCheck, [emailID, password], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured:" + err
                })
            }
            else {

                var value2 = result[0][0].Res;
                switch (value2) {
                    case "loggedIn":
                        res.status(200).json({
                            "status": "true",
                            "message": "login successfull!!"
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
            "message": "enter proper details"
        })
    }

}





user_ctlr.logout = function (req, res, next) {
    const { userid } = req.body;

    if (userid.length > 0) {
        var logout = 'call logoutCheck(?)';
        data.query(logout, [userid], (err, result) => {

            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured" + err
                })
            }
            else {
                var value3 = result[0][0].Res;
                switch (value3) {
                    case 'loggedOut':
                        res.status(400).json({
                            "status": "true",
                            "message": "logged out successfully"
                        })
                        return;

                    case 'notUserIdFound':
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

}












module.exports = user_ctlr;