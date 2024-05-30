var express = require('express');
var app = express();
var user = require('./user/user-route.js');
var booking = require('./booking/booking-route.js')
var servicelist = require('./servicelist/service-route.js')

app.use(express.json());
app.use('/user', user);

app.use('/booking', booking)

app.use('/service', servicelist)



module.exports = app;