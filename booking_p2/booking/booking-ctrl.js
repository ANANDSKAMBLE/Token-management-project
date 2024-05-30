var express = require('express');
var booking_ctlr = express.Router();
var data = require('../db.js');
var moment = require('moment');
var mail = require('../mailSender.js')
var configmail = require('../config.json')
const user_ctlr = require('../user/user-ctlr.js');


//once login show organizations
booking_ctlr.getOrganization = function (req, res, next) {
    var getOrganization = `call tmd_get_booking_getOrganization(?)`
    data.query(getOrganization, [1], (err, result) => {
        if (err) {
            res.status(400).json({
                "status": "false",
                "message": "error occured " + err
            })
        }
        else {

            var orgList = [];
            for (var i = 0; i < result[0].length; i++) {
                orgList.push(result[0][i].Organization_name);
            }
            res.status(200).json({
                "status": "true",
                "message": "list of organization",
                "data": {
                    OrganizationList: orgList
                }
            })
        }

    })
}



//show services for particular org...
booking_ctlr.getServices = function (req, res, next) {
    const { organization_id } = req.body;
    if (organization_id > 0) {
        var getServices = `call tmd_get_booking_getServices(?)`
        data.query(getServices, [organization_id], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured " + err
                })

            }
            else {
                var serviceList = [];
                for (var i = 0; i < result[0].length; i++) {
                    serviceList.push(result[0][i].title);
                }

                res.status(200).json({
                    "status": "true",
                    "message": "list of services",
                    "data": {
                        "serviceList": serviceList
                    }

                })
            }
        });


    }
    else {
        res.status(400).json({
            "status": "false",
            "message": "enter proper id"
        })
    }

}




//slot generation based on date-time and service selected
booking_ctlr.slotGeneration = function (req, res, next) {
    const { organization_id, service_id, slot_date, slot_date_time } = req.body;
    if (organization_id > 0 && service_id > 0 && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(slot_date) &&
        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(slot_date_time)) {

        var slotGeneration = `call tmd_get_booking_slotGeneration(?,?,?,?)`;
        data.query(slotGeneration, [organization_id, service_id, slot_date, slot_date_time], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured" + err
                })


            }
            else {

                res.status(200).json({
                    "status": "true",
                    "message": "slot is generated",
                    "data": {
                        "generatedSlot": [result[0][0].organization_id, result[0][0].service_id, moment(result[0][0].slot_date).format('YYYY-MM-DD'),
                        moment(result[0][0].slot_date_time).format('YYYY-MM-DD HH:mm:ss'), result[0][0].status]

                    }

                })
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



//start booking 
booking_ctlr.bookslot = function (req, res, next) {

    const { booking_user_id,
        first_name,
        last_name,
        emailID,
        mobile_isd,
        mobile_number,
        organization_id,
        service_id,
        slot_date_time,
        idnumber

    } = req.body
    if (booking_user_id > 0 && first_name.length >= 3 && emailID.length > 5 && mobile_isd.length > 2 && mobile_number.length == 10 && organization_id > 0 && service_id > 0 &&
        (idnumber == null || idnumber.length > 2) && /^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(slot_date_time)) {

        var bookslot = `call tmd_booking_save_bookslot(?,?,?,?,?,?,?,?,?,?)`;
        data.query(bookslot, [booking_user_id,
            first_name,
            last_name,
            emailID,
            mobile_isd,
            mobile_number,
            organization_id,
            service_id,
            slot_date_time,
            idnumber], (err, result) => {
                if (err) {
                    res.status(400).json({
                        "status": false,
                        "message": "error occured " + err
                    })
                }
                else {
                    console.log(result);
                    switch(result[0][0].Res)
                    {
                        case "exception":
                            res.status(500).json({
                                "status":false,
                                "message":"server side error occured "
                            })
                            return;

                        case "dataInserted":
                            res.status(500).json({
                                "status":true,
                                "message":"booking details inserted"
                            })
                            return;
                        default:
                            res.status(400).json({
                                "status":false,
                                "message":"something went wrong"

                            })


                    }



                }
            })


    }
    else {
        res.status(400).json({
            "status": false,
            "message": "enter proper details"
        })
    }












}



booking_ctlr.bookslotSendOTP=function(req,res,next){
    //SEND OTP WHILE BOOKING
    const{emailID,idnumber}=req.body;
    if(emailID.length>5)
    {

        const randomOTP = Math.floor(1000 + Math.random() * 9000);
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
                var sendOTPQuery = `call tmm_save_booking_sendOTP(?,?,?)`;
                data.query(sendOTPQuery, [emailID, randomOTP,idnumber])
                res.status(200).json(
                    {
                        "status": "true",
                        "message": "OTP sent successfully!"
                    });
            }
        });
















    }
    else
    {
        res.status(400).json({
            "status":false,
            "message":"enter proper emailId"
        })
    }
}







booking_ctlr.bookslotverifyOTP=function(req,res,next){
    const {emailID,OTP}=req.body;


    //verify OTP
    if (emailID.length > 5 && OTP.length == 4) {
        var verifyOTP = `call tmm_save_booking_verifyOTP(?,?)`;
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


//send mail after booking
booking_ctlr.bookingStatusMail=function(req,res,next){
    
}




module.exports = booking_ctlr;
