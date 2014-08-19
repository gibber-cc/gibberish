
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(5000);

console.log('Listening on port 5000');
console.log('view example at http://localhost:5000/');
console.log('view docs at http://localhost:5000/docs.html');
console.log('Listening on port 5000');