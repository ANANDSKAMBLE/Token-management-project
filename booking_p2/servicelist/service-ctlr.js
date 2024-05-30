var express = require('express');
var service_ctlr = express.Router();
var data = require('../db.js');


// validate data for createServices
function checkServices(organizationId, title, description, image, status, token_prefix,
    token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot, reset_every_day) {
    if ((organizationId != null && organizationId > 0) && (title != null && title.length > 2) && (status == 0 || status == 1)
        && token_prefix != null && token_suffix != null && (slot_timing != null && /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(slot_timing))
        && (no_of_slots != null && no_of_slots > 0) && (max_seats_for_each_slot != null && max_seats_for_each_slot > 0) && (reset_every_day == 0 || reset_every_day == 1)) {
        return true;
    }
    else {
        return false;
    }
}



service_ctlr.createServices = function (req, res, next) {
    const { organizationId,
        title,
        description,
        image,
        status,
        token_prefix,
        token_suffix,
        slot_timing,
        no_of_slots,
        max_seats_for_each_slot,
        reset_every_day } = req.body;

    if (checkServices(organizationId, title, description, image, status, token_prefix,
        token_suffix, slot_timing, no_of_slots, max_seats_for_each_slot, reset_every_day)
    ) {

        var createServices = `call tmm_save_service_createService(?,?,?,?,?,?,?,?,?,?,?)`;
        data.query(createServices,
            [organizationId,
                title,
                description,
                image,
                status,
                token_prefix,
                token_suffix,
                slot_timing,
                no_of_slots,
                max_seats_for_each_slot,
                reset_every_day], (err, result) => {
                    if (err) {
                        res.status(400).json({
                            "status": "false",
                            "message": "error occured : " + err
                        })
                    }
                    else {

                        var value = result[0][0].Res;
                        switch (value) {
                            case "inserted":
                                res.status(200).json({
                                    "status": "true",
                                    "message": "service created successfuuly"
                                })
                                return;

                            case "exception":
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

    var createServices = `call createServices()`;
    data.query(createServices, [organizationId,
        title,
        description,
        image,
        status,
        token_prefix,
        token_suffix,
        slot_timing,
        no_of_slots,
        max_seats_for_each_slot,
        reset_every_day], (err, result) => {






        })



};


//set working hours for organization
service_ctlr.workingHours = function (req, res, next) {
    const { organization_id,
        service_id,
        week_day,
        start_time,
        end_time
    } = req.body;
    if (week_day >= 0 && week_day <= 5) {
        if ((organization_id != null && organization_id > 0) && (service_id != null && service_id > 0) &&
            /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(start_time) && /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(end_time)) {
            if (start_time < end_time) {
                var workingHours = `call tmm_save_service_workingHours(?,?,?,?,?)`;

                data.query(workingHours, [organization_id,
                    service_id,
                    week_day,
                    start_time,
                    end_time], (err, result) => {

                        if (err) {
                            res.status(400).json({
                                "status": "false",
                                "message": "error occured " + err
                            })
                            return;
                        }
                        else {
                            var value1 = result[0][0].Res;
                            switch (value1) {
                                case "inserted":
                                    res.status(200).json({
                                        "status": "true",
                                        "message": "workingHours inserted !"
                                    })
                                    return;




                                case "exception":
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
                    "status": 'false',
                    "message": "end time can't be less that start time !"
                })
            }



        }
        else {
            res.status(400).json({
                "status": 'false',
                "message": "enter proper details !"
            })
        }

    }
    else if (week_day == 6) {

        if ((organization_id != null && organization_id > 0) && (service_id != null && service_id > 0) && start_time == null && end_time == null) {

            var workingHours = `call insertWorkingHours(?,?,?,?,?)`;

            data.query(workingHours, [organization_id,
                service_id,
                week_day,
                start_time,
                end_time], (err, result) => {

                    if (err) {
                        res.status(400).json({
                            "status": "false",
                            "message": "error occured " + err
                        })
                        return;
                    }
                    else {
                        var value1 = result[0][0].Res;
                        switch (value1) {
                            case "inserted":
                                res.status(200).json({
                                    "status": "true",
                                    "message": "workingHours inserted !"
                                })
                                return;


                            case "exception":
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
            res.status(200).json({
                "status": "false",
                "message": "enter proper details!"
            })

        }


    }
    else {
        res.status(400).json({
            "status": 'false',
            "message": "enter proper details !"
        })
    }











}


service_ctlr.addHolidays=function(req,res,next){
    const {userid, serviceid,holidayDate, holidayDescription}=req.body;
    if(userid>0 && serviceid>0 && (holidayDate==null || /^\d{4}-\d{2}-\d{2}$/.test(holidayDate)) )
    {

        var addHolidays=`call tmm_save_service_addHolidays(?,?,?,?)`;
        data.query(addHolidays,[userid, serviceid,holidayDate, holidayDescription],(err,result)=>{
            if(err){
                res.status(400).json({
                    "status":"false",
                    "message":"error occured "+ err
                })
            }
            else{

                var value3=result[0][0].Res;
                switch(value3){
                    case "inserted":
                        res.status(200).json({
                            "status":"true",
                            "message":"Holidays Added"
                        })
                        return;
                    case "exception":
                        res.status(500).json({
                            "status":"false",
                            "message":"server side error occured"
                        })
                        return;
                }
            }



        })


    }
    else{

        res.status(400).json({
            "status":"false",
            "message":"enter proper details"
        })

    }


}




service_ctlr.servicelist=function(req,res,next){
    const {organizationId} =req.body;
    if(organizationId>0)
    {
        var servicelist=`call tmm_get_service_servicelist(?)`;
        data.query(servicelist,[organizationId],(err,result)=>{
            if(err)
            {
                res.status(400).json({
                    "status":"false",
                    "message":"error occured "+ err
                })

            }
            else
            {
                if(result[0].length==0)
                {
                    res.status(200).json({
                        "status":"true",
                        "message":"no services found",
                        "data":{services:[]}
    
                    })
                }
                else
                {
                    var servicearray=[];
                    for(var i=0;i<result[0].length;i++)
                        {
                            servicearray.push(result[0][i].Res);    
                        }
                }

                res.status(200).json({
                    "status":"true",
                    "message":"service list fetched",
                    "data":{"servcelist":servicearray}
                })

            }


        })

    }
    else
    {
        res.status(400).json({
            "status":"false",
            "message":"enter valid id"
        })


    }


}


service_ctlr.ServiceDetails=function(req,res,next){
    const {service_id}=req.body;
    if(service_id>0)
    {
        var ServiceDetails=`call tmm_get_service_ServiceDetails(?)`;
        data.query(ServiceDetails,[service_id],(err,result)=>{
            if(err)
            {
                res.status(400).json({
                    "status":"false",
                    "message":"error occured "+err
                })
            }
            else
            {
                res.status(200).json({
                    "status":"true",
                    "message":"service details fetched",
                    "data":result[0][0]
                })





            }






        })


    }
    else
    {
        res.status(400).json({
            "status":"false",
            "message":"enter valid  service id"
        })
    }

}



service_ctlr.updateServiceDetails=function(req,res,next){

    const {serviceid,title,description,status,slot_timing,no_of_slots,max_seats_for_each_slot}=req.body;
    if(serviceid>0 && title !=null && title.length>2 && (status==1 || status==0) && /^(2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/.test(slot_timing) &&
        no_of_slots>0 && max_seats_for_each_slot>0)
    {
        var updateServiceDetails=`call tmm_save_service_updateServiceDetails(?,?,?,?,?,?,?)`;
        data.query(updateServiceDetails,[serviceid,title,description,status,slot_timing,no_of_slots,max_seats_for_each_slot],(err,result)=>{
            if(err)
            {
                res.status(400).json({
                    "status":"false",
                    "message":"error occrured "+ err
                })
            }
            else
            {
                switch(result[0][0].Res)
                {
                    case "updated":
                        res.status(200).json({
                            "status":"true",
                            "message":"details updated successully"
                        })
                        return;
                    
                    case "exception":
                        res.status(500).json({
                            "status":"false",
                            "message":"server side error occured"
                        })
                        return;
                    
                    default:
                        res.status(500).json({
                            "status":"false",
                            "message":"unknown error occured"
                        })
                        return;
                    
                }
               
                
            }
        
        })

    }
    else
    {
        res.status(400).json({
            "status":"false",
            "message":"enter proper details"
        })

    }






}







module.exports = service_ctlr;
