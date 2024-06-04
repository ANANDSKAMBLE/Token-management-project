var express = require('express');
var booking_ctlr = express.Router();
var data = require('../db.js');
var moment = require('moment');
var mail = require('../mailSender.js')
var configmail = require('../config.json')
const user_ctlr = require('../user/user-ctlr.js');


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
            console.log(result);

            var orgList = [];
            for (var i = 0; i < result[0].length; i++) {
                let key = result[0][i].tid;
                let value1 = result[0][i].Organization_name;
                let value2 = result[0][i].Organization_profile;
                let value3 = result[0][i].image;
                let value4 = result[0][i].emailID;
                let value5 = result[0][i].mobile_isd;
                let value6 = result[0][i].mobile_number;
                orgList.push({ [key]: [value1, value2, value3, value4, value5, value6] });
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





//after pressing a particular comapny name get it's services
booking_ctlr.getServices = function (req, res, next) {
    const { uuid } = req.body;
    if (uuid.length >= 4) {
        var servicelist = `call tmm_get_booking_getServices(?)`;
        data.query(servicelist, [uuid], (err, result) => {
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

                    console.log(result);
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
            "message": "enter valid id"
        })

    }

}







function datavalidationFunction1(service_id, uuid) {

    const errors = []
    if (service_id <= 0 || service_id == null) {
        errors.push("invalid service ID");
    }

    if (uuid.length < 4) {
        errors.push("invalid UUID");
    }
    return errors;
}

//after pressing a particular service get it's details
booking_ctlr.getServicesDetails = function (req, res, next) {
    const { uuid, service_id } = req.body;

    const error = datavalidationFunction1(service_id, uuid);

    if (error.length == 0) {

        var ServiceDetails = `call tmm_get_booking_ServiceDetails(?,?)`;

        data.query(ServiceDetails, [uuid, service_id], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured " + err
                })
            }

            else {


                var workingHourArray = []
                for (let i = 0; i < result[0].length; i++) {
                    let key = result[0][i].week_day;
                    let value1 = result[0][i].timing;
                    let value2 = result[0][i].serviceStatus;


                    workingHourArray.push({ [key]: [value1, value2] });
                }


                res.status(200).json({
                    "status": "true",
                    "message": "service details fetched",
                    "data": {
                        serviceID: result[0][0].tid,
                        title: result[0][0].title,
                        description: result[0][0].description,
                        status: result[0][0].status,
                        slotTiming: result[0][0].slot_timing,
                        noOfSlots: result[0][0].no_of_slots,
                        maxSeatForEachSlot: result[0][0].max_seats_for_each_slot,
                        workingHours: workingHourArray,


                    }
                })


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










function datavalidationFunction2(uuid, service_id, slot_date_time) {
    const errors = [];
    if (uuid == null || uuid.length < 4) {
        errors.push('invalid UUID');
    }
    if (service_id == null || service_id <= 0) {
        errors.push('invalid serviceID');
    }

    if (!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(slot_date_time))) {
        errors.push('invalid date selected');
    }

    return errors;
}







//slot generation based on dateTime and service selected
booking_ctlr.slotGeneration = function (req, res, next) {
    const { uuid, service_id, slot_date_time } = req.body;

    const error = datavalidationFunction2(uuid, service_id, slot_date_time);

    if (error.length == 0) {

        var slotGeneration = `call tmd_get_booking_slotGeneration(?,?,?)`;

        data.query(slotGeneration, [uuid, service_id, slot_date_time], (err, result) => {
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



function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function datavalidationFunction3(uuid, first_name, last_name, emailID, mobile_isd, mobile_number,
    organization_id, service_id, slot_date_time, idnumber) {
    const errors = [];
    if (uuid == null || uuid.length<4 ) {
        errors.push('invalid uuid');
    }

    if (first_name.length < 3) {
        errors.push('firstName contains atleast 2 charactor');
    }

    if (!(isValidEmail(emailID))) {
        errors.push('invalid emailID');
    }

    if (mobile_isd.length < 3) {
        errors.push('invalid mobileISD');
    }

    if (mobile_number.length != 10) {
        errors.push('invalid mobileNumber');
    }

    if (organization_id <= 0 || service_id <= 0) {
        errors.push('invalid organizationId or serviceId');
    }

    if (!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(slot_date_time))) {
        errors.push('invalid slot date and time');
    }

    return errors;
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


    const error = datavalidationFunction3(uuid, first_name, last_name, emailID, mobile_isd, mobile_number,
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



function datavalidationFunction4(emailID, idnumber) {
    const errors = [];

    if (!isValidEmail(emailID)) {
        errors.push('envalid emailID');
    }
    return errors;
}

//SEND OTP WHILE BOOKING
booking_ctlr.bookslotSendOTP = function (req, res, next) {

    const { emailID, idnumber } = req.body;

    const error = datavalidationFunction4(emailID, idnumber);

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
                        "data":{
                            'emailID':emailID
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



function datavalidationFunction5(emailID, OTP){
    const errors=[];

    if(!isValidEmail(emailID)){
        errors.push('invalid email id');
    }

    if(OTP.length!=4){
        errors.push('invalid OTP');
    }

    return errors;
}




booking_ctlr.bookslotverifyOTP = function (req, res, next) {
    const { emailID, OTP } = req.body;

    const error=datavalidationFunction5(emailID, OTP);


    if(error.length==0){

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
                            cc:"askamble310@gmail.com,arun.gavimath@talentmicro.com",
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
        })


    }
    else{
        res.status(400).json({
            "status":false,
            "message":"enter proper details:" + error.join(", ")
        })
    }


    

}







module.exports = booking_ctlr;
