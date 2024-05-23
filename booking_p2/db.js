var mysql=require('mysql');
var config=require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/config.json')

var connection = mysql.createConnection({
    host     : config.db.host,
    user     : config.db.username,
    password : config.db.password,
    database:config.db.database
  });
  
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err);
      return;
    }
    console.log('connected');
  });

module.exports=connection;