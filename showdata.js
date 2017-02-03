var express = require('express');
var app = express();
/* var argv = require('minimist')(process.argv.slice(2));
var gettableexpress = require("./gettableexpress.js")
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var favicon = require('serve-favicon');
var https = require('https')
var fs = require('fs') */
var serveStatic = require('serve-static')

var httpport = 85;
//app.use('/get/ticker.json', gettableexpress.expressjson("tickers"));
app.use("/interface", function (req, res, next) {
	next();
}, serveStatic('interface'));
app.use("/node_modules", serveStatic('node_modules'));
app.use("/", serveStatic('public'));
var pos= 0;
var SerialPort = require('serialport');
	
	SerialPort.list(function (err, ports) {
		ports.forEach(function(port) {
			console.log(port.comName);
			console.log(port.pnpId);
			console.log(port.manufacturer);
		});
	});
	//var port = new SerialPort('COM5');
	var port = new SerialPort('COM3', { autoOpen: true, baudRate: 9600 });
	port.on('data', function (data) {
		console.log('Data: ' + data);
	});  

app.use('/getSerial.json', function (req, res, next) {
	
	res.json({result: pos});
	next();
	
	
	
});

//app.use("/", serveStatic('public'));
var server = app.listen(httpport);
