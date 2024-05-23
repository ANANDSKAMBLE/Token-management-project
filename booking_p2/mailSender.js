var nodemailer=require("nodemailer");
var config=require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/config.json')

var myMailSide = nodemailer.createTransport({
    service: config.emailCredentials.service,
    auth: {
      user: config.emailCredentials.auth.user,
      pass: config.emailCredentials.auth.pass
    }
  });


  module.exports=myMailSide;