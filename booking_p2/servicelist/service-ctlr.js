var express = require('express');
var service_ctlr = express.Router();
var data = require('../db.js');
var moment=require('moment');
var lodash=require('lodash');







function datavalidationFunction0(uuid, title, description, image, status,
    token_prefix, token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot,
    reset_every_day, service_id, start_time, end_time, week_day, holiday_Date, holiday_desc) {

    const errors = [];


    if (uuid == null || uuid.length < 4) {
        errors.push('Invalid uuid');
    }

    if (title == null || title.length <= 2) {
        errors.push('Invalid title');
    }


    if (![0, 1].includes(status)) {
        errors.push('Invalid status');
    }


    if (token_prefix == null || token_prefix.length < 3) {
        errors.push('token_prefix cannot be null & has atleast 2 charector');
    }

    if (token_suffix == null || token_suffix.length < 3) {
        errors.push('token_suffix cannot be null & has atleast 2 charector');
    }


    if (!/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(slot_timing)) {
        errors.push('Invalid slot_timing');
    }

    if (no_of_slots == null || no_of_slots <= 0) {
        errors.push('Invalid no_of_slots');
    }
    if (max_seats_for_each_slot == null || max_seats_for_each_slot <= 0) {
        errors.push(' Invalid max_seats_for_each_slot');
    }

    if (service_id != null && service_id <= 0) {
        errors.push('service id must ge greater than 0');
    }


    if (![0, 1].includes(reset_every_day)) {
        errors.push('Invalid reset_every_day');
    }

    if (!/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(start_time) || !/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(end_time)) {
        errors.push('Invalid strat_time or end_time');
    }


    if (!(week_day >= 0 && week_day <= 6)) {
        errors.push('Invalid weekday');
    }

    if (!(/^\d{4}-\d{2}-\d{2}$/.test(holiday_Date))) {
        errors.push('Invalid holidayDate');
    }



    return errors;
}














































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
        week_day,
        start_time,
        end_time,
        holiday_Date,
        holiday_desc } = req.body;

    const error = datavalidationFunction0(uuid, title, description, image, status,
        token_prefix, token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot,
        reset_every_day, service_id, start_time, end_time, week_day, holiday_Date, holiday_desc);


    if (error.length === 0) {

        var createServices = `call tmm_save_service_createService(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        data.query(createServices, [uuid, title, description, image, status,
            token_prefix, token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot,
            reset_every_day, service_id, week_day, start_time, end_time, holiday_Date, holiday_desc], (err, result) => {
                if (err) {
                    res.status(400).json({
                        "status": false,
                        "message": "error occured: " + err
                    })
                }
                else {
                    console.log(result);

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
                        "data": { services: servicearray }

                    })
                }
                else {

                    for (var i = 0; i < result[0].length; i++) {
                        let key = result[0][i].tid;
                        let value = result[0][i].title

                        servicearray.push({ [key]: value });
                    
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

function datavalidationFunction1(service_id,uuid){

    const errors=[]
    if(service_id<=0 || service_id==null){
        errors.push("invalid service ID");
    }

    if(uuid.length<4){
        errors.push("invalid UUID");
    }
    return errors;
}



service_ctlr.ServiceDetails = function (req, res, next) {
    const { uuid,service_id } = req.body;

    const error=datavalidationFunction1(service_id,uuid);

    if(error.length==0){

        var ServiceDetails = `call tmm_get_service_ServiceDetails(?,?)`;

        data.query(ServiceDetails, [uuid,service_id], (err, result) => {
            if (err) {
                res.status(400).json({
                    "status": "false",
                    "message": "error occured " + err
                })
            }

            else {
                console.log(result);

                var workingHourArray=[]
                for( let i=0;i<result[0].length;i++){
                    let key=result[0][i].week_day;
                    let value1=result[0][i].start_time;
                    let value2=result[0][i].end_time;

                    workingHourArray.push({[key]:[value1,value2]});
                }
                var uniqueWorkingHourArray=[...new Set(workingHourArray.map(obj => Object.keys(obj)[0]))]
                .map(key => ({ [key]: workingHourArray.find(obj => Object.keys(obj)[0] === key)[key] }));


                console.log(uniqueWorkingHourArray);
                var holidayArray=[];
                for( let i=0;i<result[0].length;i++){
                    let key=(result[0][i].holiday_date);
                    let value1=result[0][i].holiday_desc;
                    
                    

                    holidayArray.push({[key]:[value1]});
                }
               

                var uniqueHolidayArray = [...new Set(holidayArray.map(obj => Object.keys(obj)[0]))]
                .map(key => ({ [key]: holidayArray.find(obj => Object.keys(obj)[0] === key)[key] }));
                console.log(uniqueHolidayArray);

                res.status(200).json({
                    "status": "true",
                    "message": "service details fetched",
                    "data": {
                        title:result[0][0].title,
                        description:result[0][0].description,
                        status:result[0][0].status,
                        slotTiming:result[0][0].slot_timing,
                        noOfSlots:result[0][0].slot_timing,
                        maxSeatForEachSlot:result[0][0].max_seats_for_each_slot,
                        workingHours:uniqueWorkingHourArray,
                        holidays:uniqueHolidayArray

                    }
                })


            }


        })



    }
    else{
        res.status(400).json({
            "status":false,
            "message":"enter valid details :"+ error.join(", ")
        })
    }


};















module.exports = service_ctlr;
