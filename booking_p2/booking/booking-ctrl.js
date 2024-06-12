var express = require('express');
var booking_ctlr = express.Router();
var data = require('../db.js');
var moment = require('moment');
var mail = require('../mailSender.js')
var configmail = require('../config.json')
const user_ctlr = require('../user/user-ctlr.js');

var { getServicesDetails_validation, slotGeneration_validation,
    bookslot_validation, bookslotSendOTP_validation, bookslotverifyOTP_validation
} = require('../dataValidationFunction/validation.js')





//after public login show company list
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

            if (result[0].length == 0) {
                res.status(400).json({
                    "status": "false",
                    "message": "no data found"
                })

            }
            else {

                var orgList = [];
                for (var i = 0; i < result[0].length; i++) {
                    let organizationId = result[0][i].tid;
                    let Organization_name = result[0][i].Organization_name;
                    let Organization_profile = result[0][i].Organization_profile;
                    let image = result[0][i].image;
                    let emailID = result[0][i].emailID;
                    let mobile_isd = result[0][i].mobile_isd;
                    let mobile_number = result[0][i].mobile_number;

                    orgList.push({
                        'organizationId': organizationId,
                        'Organization_name': Organization_name,
                        'Organization_profile': Organization_profile,
                        'image': image,
                        'emailID': emailID,
                        'mobile_isd': mobile_isd,
                        'mobile_number': mobile_number

                    });
                }

                res.status(200).json({
                    "status": "true",
                    "message": "list of organization",
                    "data": {
                        OrganizationList: orgList
                    }
                })

            }


        }

    })
}





//after pressing a particular comapny name get it's services
booking_ctlr.getServices = function (req, res, next) {
    const { organizationId } = req.body;
    if (organizationId > 0) {
        var servicelist = `call tmm_get_booking_getServices(?)`;
        data.query(servicelist, [organizationId], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured " + err
                })

            }
            else {
                var servicearray = [];
                if (result[0].length == 0) {
                    res.status(200).json({
                        "status": "true",
                        "message": "no services found",
                        "data": { services: servicearray }

                    })
                }
                else {


                    var serviceListArray = [];
                    for (let i = 0; i < result[0].length; i++) {
                        let tid = result[0][i].tid;
                        let title = result[0][i].title;
                        serviceListArray.push({ 'serviceID': tid, 'title': title })
                    }


                    res.status(200).json({
                        "status": "true",
                        "message": "service list fetched",
                        "data": serviceListArray
                    })

                }

            }


        })

    }
    else {
        res.status(400).json({
            "status": "false",
            "message": "enter valid organizationId"
        })

    }

}







//after pressing a particular service get it's details
booking_ctlr.getServicesDetails = function (req, res, next) {
    const { organizationId, service_id } = req.body;

    const error = getServicesDetails_validation(service_id, organizationId);

    if (error.length == 0) {

        var ServiceDetails = `call tmm_get_booking_ServiceDetails(?,?)`;

        data.query(ServiceDetails, [organizationId, service_id], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured " + err
                })
            }

            else {
                var workingHourArray = [];
                if (result[0].length == 0) {
                    res.status(400).json({
                        "status": "false",
                        "message": "data not found"
                    })

                }
                else {
                    for (let i = 0; i < result[0].length; i++) {
                        let week_day = result[0][i].week_day;
                        let timing = result[0][i].timing;
                        let serviceStatus = result[0][i].serviceStatus;

                        workingHourArray.push({ 'week_day': week_day, 'timing': timing, 'serviceStatus': serviceStatus });

                    }
                    res.status(200).json({
                        "status": "true",
                        "message": "service details fetched",
                        "data": {
                            serviceID: result[0][0].tid,
                            title: result[0][0].title,
                            description: result[0][0].description,
                            status: result[0][0].status,
                            slot_timing: result[0][0].slot_timing,
                            no_of_slots: result[0][0].no_of_slots,
                            max_seats_for_each_slot: result[0][0].max_seats_for_each_slot,
                            workingHourArray: workingHourArray,

                        }
                    })
                }
            }
        })

    }
    else {
        res.status(400).json({
            "status": false,
            "message": "enter valid details :" + error.join(", ")
        })
    }


};







//slot generation based on dateTime and service selected
booking_ctlr.slotGeneration = function (req, res, next) {
    const { uuid, organizationId, service_id, slot_date_time } = req.body;

    const error = slotGeneration_validation(uuid, organizationId, service_id, slot_date_time);

    if (error.length == 0) {

        var slotGeneration = `call tmd_get_booking_slotGeneration(?,?,?,?)`;

        data.query(slotGeneration, [uuid, organizationId, service_id, slot_date_time], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured" + err
                })


            }
            else {

                var slotArray = [];
                slotArray.push({ 'organization_id': result[0][0].organization_id },
                    { 'service_id': result[0][0].service_id },
                    { 'slot_date_time': result[0][0].slot_date_time },
                    { 'max_seat': result[0][0].max_seat },
                    { 'availableSeats': result[0][0].availableSeats },
                    { 'status': result[0][0].status })

                res.status(200).json({
                    "status": "true",
                    "message": "slot is generated",
                    "data": {
                        "generatedSlot": slotArray
                    }

                })
            }

        })

    }
    else {
        res.status(400).json({
            "status": false,
            "message": "enter proper details " + error.join(", ")
        })
    }
}







//start booking 
booking_ctlr.bookslot = function (req, res, next) {

    const { uuid,
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


    const error = bookslot_validation(uuid, first_name, last_name, emailID, mobile_isd, mobile_number,
        organization_id, service_id, slot_date_time, idnumber);


    if (error.length == 0) {

        var bookslot = `call tmd_booking_save_bookslot(?,?,?,?,?,?,?,?,?,?)`;

        data.query(bookslot, [uuid,
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

                    switch (result[0][0].Res) {
                        case "exception":
                            res.status(500).json({
                                "status": false,
                                "message": "server side error occured "
                            })
                            return;

                        case "dataInserted":
                            res.status(200).json({
                                "status": true,
                                "message": "booking details inserted",
                                "data": {
                                    'emailId': emailID,
                                    'idNumber': idnumber
                                }
                            })
                            return;

                        case "idrequired":
                            res.status(400).json({
                                "status": false,
                                "message": "ID number required"
                            })
                            return;

                        default:
                            res.status(400).json({
                                "status": false,
                                "message": "something went wrong"

                            })


                    }

                }
            })


    }
    else {
        res.status(400).json({
            "status": false,
            "message": "enter valid details:" + error.join(", ")
        })
    }


}






//SEND OTP WHILE BOOKING
booking_ctlr.bookslotSendOTP = function (req, res, next) {

    const { emailID, idnumber } = req.body;

    const error = bookslotSendOTP_validation(emailID, idnumber);

    if (error.length == 0) {
        const randomOTP = Math.floor(1000 + Math.random() * 9000);

        var mailDetails = {

            from: configmail.emailCredentials.auth.user,
            to: emailID,
            subject: 'OTP for booking verification',
            text: `Your OTP is: ${randomOTP} valid for 10 minutes`
        };


        mail.sendMail(mailDetails, function (error, info) {
            if (error) {
                res.status(400).json(
                    {
                        "status": "false",
                        "message": "error occured: " + error
                    });
            }
            else {
                var sendOTPQuery = `call tmm_save_booking_sendOTP(?,?,?)`;
                data.query(sendOTPQuery, [emailID, randomOTP, idnumber])
                res.status(200).json(
                    {
                        "status": "true",
                        "message": "OTP sent successfully!",
                        "data": {
                            'emailID': emailID
                        }
                    });
            }
        });

    }
    else {
        res.status(400).json({
            'status': false,
            'message': "enter valid details: " + error.join(", ")
        })
    }


}







booking_ctlr.bookslotverifyOTP = function (req, res, next) {
    const { emailID, OTP } = req.body;

    const error = bookslotverifyOTP_validation(emailID, OTP);


    if (error.length == 0) {

        var verifyOTP = `call tmm_save_booking_verifyOTP(?,?)`;



        data.query(verifyOTP, [emailID, OTP], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured : " + err

                })
            }
            else {
                console.log(result)
                if(result[0].length==0){
                    res.status(400).json({
                        "status": "false",
                        "message": "no data found"
    
                    })

                }
                else{
                    switch (result[0][0].Res) {
                        case 'not-verified':
                            res.status(400).json({
                                "status": "false",
                                "message": "otp is not verified"
    
                            })
                            return;
    
                        case "exception":
                            res.status(500).json({
                                "status": "false",
                                "message": "server error occured"
                            })
                            return;
    
                        case "verified":
                            var mailDetails = {
    
                                from: configmail.emailCredentials.auth.user,
                                to: result[0][0].email_id,
                                subject: result[0][0].subject,
                                text: result[0][0].mail_content
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
    
                                    res.status(200).json(
                                        {
                                            "status": "true",
                                            "message": "slot booked successfully!",
    
                                        });
                                }
                            });
                            return;
    
    
                    }

                }

                

            }
        })


    }
    else {
        res.status(400).json({
            "status": false,
            "message": "enter proper details:" + error.join(", ")
        })
    }




}







module.exports = booking_ctlr;
