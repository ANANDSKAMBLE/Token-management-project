var express = require('express');
var app = express();
var user = require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/user/user-route.js');
var booking = require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/booking/booking-route.js')
var servicelist = require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/servicelist/service-route.js')

app.use(express.json());
app.use('/user', user);

app.use('/booking', booking)

app.use('/servicelist', servicelist)



module.exports = app;