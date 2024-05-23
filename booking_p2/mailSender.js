var nodemailer=require("nodemailer");
var config=require('./config.json')

var myMailSide = nodemailer.createTransport({
    service: config.emailCredentials.service,
    auth: {
      user: config.emailCredentials.auth.user,
      pass: config.emailCredentials.auth.pass
    }
  });


  module.exports=myMailSide;