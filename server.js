var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(20000);

console.log('Listening on port 5000');
console.log('view example at http://localhost:20000/');
console.log('view docs at http://localhost:20000/docs.html');