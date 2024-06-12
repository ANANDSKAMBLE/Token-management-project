var express = require('express');
var service_ctlr = express.Router();
var data = require('../db.js');
var moment = require('moment');
var lodash = require('lodash');

var { createServices_validation,ServiceDetails_validation } = require('../dataValidationFunction/validation.js');
const { json } = require('body-parser');





//for company allow creatig it's services

service_ctlr.createServices = function (req, res, next) {
    const { uuid,
        title,
        description,
        image,
        status,
        token_prefix,
        token_suffix,
        slot_timing,
        no_of_slots,
        max_seats_for_each_slot,
        reset_every_day,
        service_id,
        working_hours,
        addHolidays } = req.body;

    const error = createServices_validation(uuid, title, description, image, status,
        token_prefix, token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot,
        reset_every_day, service_id,working_hours, addHolidays);


    if (error.length === 0) {
        const workingHoursJSON = JSON.stringify(working_hours);
        const addHolidaysJSON = JSON.stringify(addHolidays);

        var createServices = `call tmm_save_service_createService(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        data.query(createServices, [uuid, title, description, image, status,
            token_prefix, token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot,
            reset_every_day, service_id,workingHoursJSON, addHolidaysJSON], (err, result) => {
                if (err) {
                    res.status(400).json({
                        "status": false,
                        "message": "error occured: " + err
                    })
                }
                else {
                    console.log(result[0].length);
                    if(result[0].length==0){
                        res.status(400).json({
                            "status": false,
                            "message": "no data found" 
                        })
                    }
                    else{

                        switch (result[0][0].Res) {
                            case "serviceCreated":
                                res.status(200).json({
                                    "status": true,
                                    "message": "service created successfully!",
                                    "data": {
                                        title: result[0][0].title,
                                        serviceID: result[0][0].serviceID
                                    }
                                })
                                return;
    
                            case "serviceUpdated":
                                res.status(200).json({
                                    "status": true,
                                    "message": "service updated successfully!",
                                    "data": {
                                        title: result[0][0].title,
                                        serviceID: result[0][0].serviceID
                                    }
                                })
                                return;
    
                            default:
                                res.status(500).json({
                                    "status": false,
                                    "message": "server side error occured"
    
                                })
                                return;
    
                        }

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





//after pressing 'myServices'  show all  services title list
service_ctlr.servicelist = function (req, res, next) {
    const { uuid } = req.body;
    if (uuid.length >= 4) {
        var servicelist = `call tmm_get_service_servicelist(?)`;
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
                        "data": { "servcelist": servicearray }

                    })
                }
                else {

                    for (var i = 0; i < result[0].length; i++) {   
                        let tid = result[0][i].tid;
                        let title = result[0][i].title

                        servicearray.push({ 'serviceId':tid,'title':title });

                    }
                    res.status(200).json({
                        "status": "true",
                        "message": "service list fetched",
                        "data": { "servcelist": servicearray }
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





//after pressing particular service show all services details
service_ctlr.ServiceDetails = function (req, res, next) {
    const { uuid, service_id } = req.body;

    const error = ServiceDetails_validation(service_id, uuid);

    if (error.length == 0) {

        var ServiceDetails = `call tmm_get_service_ServiceDetails(?,?)`;

        data.query(ServiceDetails, [uuid, service_id], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured " + err
                })
            }

            else {
                
                if(result[0].length==0){
                    res.status(400).json({
                        "status": "true",
                        "message": "no services details found",
                    })
                }
                else{

                    const workingHours=JSON.parse(result[0][0].p_workingHourJSON);
                    const addholidays=JSON.parse(result[0][0].p_addHolidaysJSON);

                    res.status(200).json({
                        "status": "true",
                        "message": "service details fetched",
                        "data": {
                            p_title: result[0][0].p_title,
                            p_description: result[0][0].p_description,
                            p_status: result[0][0].p_status,
                            p_slot_timing: result[0][0].p_slot_timing,
                            p_no_of_slots: result[0][0].p_no_of_slots,
                            p_max_seats_for_each_slot: result[0][0].p_max_seats_for_each_slot,
                            workingHours: workingHours,
                            holidays: addholidays
    
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









module.exports = service_ctlr;
