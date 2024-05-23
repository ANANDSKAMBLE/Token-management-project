var express = require('express');
var booking_ctlr = express.Router();



booking_ctlr.bookSlot=function(req, res, next) {
    res.send("booking-ctlr is running");
};








module.exports = booking_ctlr;
