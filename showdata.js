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
var serialData='';
var readyToWrite = false;
/*
var port = new SerialPort('COM3', { autoOpen: true, baudRate: 9600 });
port.on('data', function (data) {
	if(data=='ready') readyToWrite = true;
	serialData = data;
	console.log('Data: ' + data);
	
		
});*/
/*port.on('close', function (data) {
	port.open();
});*/
/*while(!readyToWrite)
{
	console.log('waiting..');
	if(readyToWrite)
	port.write('f1');
}*/
app.use('/getSerial.json', function (req, res, next) {
	var url = require('url');
	var q = url.parse(req.url, true).query;
	port.write(q.f);
	res.json({result: ''+q.f});
	
});
app.use('/getFermData.json', function (req, res, next) {
	var mysqlconfig = require("./dbconfig.js").out;
	var mysql = require('mysql');
	var url = require('url');

	
	var connection = mysql.createConnection(mysqlconfig);
	connection.query("select f.id as id, f.nombre as nombre_fermentacion ,p.nombre as profile , f.fecha_inicio as fecha_inicio, getHours(f.fecha_inicio) as total_hours, f.activo as activo, p.duration as duration, t.code as tanque_code, getLastTemp(f.id) as currentTemp, t.descripcion as tanque_descripcion from fermentadores as f inner join profiles as p on f.profile = p.id inner join tanques as t on t.id = f.tanque;", function(err, resultsData, fields) {
		if (err) 
		{
			throw err;
		}
		//console.log(resultsData)
		var ferms = [];
		for(var i = 0; i < resultsData.length; i++)
		{
			var ferm = {
				id: resultsData[i].id,
				nombre_fermentacion: resultsData[i].nombre_fermentacion,
				profile: resultsData[i].profile,
				tanque_code: resultsData[i].tanque_code,
				tanque_descripcion: resultsData[i].tanque_descripcion,
				total_hours: resultsData[i].total_hours,
				duration : resultsData[i].duration,
				currentTemp: resultsData[i].currentTemp
			}
			ferms.push(ferm);
		}
		res.json(ferms);
				
	});
	
	
	
});
//app.use("/", serveStatic('public'));
var server = app.listen(httpport);
