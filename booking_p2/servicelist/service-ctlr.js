var express = require('express');
var service_ctlr = express.Router();

service_ctlr.getAllServices=function(req, res, next) {
    res.send("service-ctlr is running");
};










module.exports = service_ctlr;
