exports.serialdata = function(){
	
return function (req, res, next) {	
	var SerialPort = require('serialport');
	SerialPort.list(function (err, ports) {
	  ports.forEach(function(port) {
		console.log(port.comName);
		console.log(port.pnpId);
		console.log(port.manufacturer);
			res.json({result: port.comName});
	  });
	});

	connection.end();
}

}