var http= require('http');

const app = require('C:/Users/Anand S Kamble/Desktop/html/booking_p2/app.js');
const port = 3030;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});






