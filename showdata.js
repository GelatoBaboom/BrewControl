var express = require('express');
var app = express();
/* var argv = require('minimist')(process.argv.slice(2));
var gettableexpress = require("./gettableexpress.js")
var jsonParser = bodyParser.json()
var favicon = require('serve-favicon');
var https = require('https')
var fs = require('fs') */
var mysqlconfig = require("./dbconfig.js").out;
var mysql = require('mysql');
var bodyParser = require('body-parser')
var serveStatic = require('serve-static')
var url = require('url');

var httpport = 85;
//app.use('/get/ticker.json', gettableexpress.expressjson("tickers"));
app.use("/interface", function (req, res, next) {
	next();
}, serveStatic('interface'));
app.use("/node_modules", serveStatic('node_modules'));
app.use("/", serveStatic('public'));



var SerialPort = require('serialport');
SerialPort.list(function (err, ports) {
	ports.forEach(function(port) {
		console.log(port.comName);
		console.log(port.pnpId);
		console.log(port.manufacturer);
	});
});
app.use('/getSerial.json', function (req, res, next) {
	var url = require('url');
	var q = url.parse(req.url, true).query;
	port.write(q.f);
	res.json({result: ''+q.f});
	
});
app.use(bodyParser.json());
app.use('/createFerm.json', function (req, res, next) {

	var selParams = [];
	var connection = mysql.createConnection(mysqlconfig);
	selParams = selParams.concat([req.body.nombre,req.body.tanque,req.body.perfil]);
	connection.query("call insertFermentacion(?,?,?);",selParams, function(err, resultsData, fields) {
		if (err) 
		{
			throw err;
		}
	})
	connection.end();
});
app.use('/profUpdate.json', function (req, res, next) {
	
	var connection = mysql.createConnection(mysqlconfig);
	for(var i = 0; i < req.body.length; i++){
		var selParams = [];
		selParams = selParams.concat([req.body[i].nombre,req.body[i].duration,req.body[i].id]);
		connection.query("UPDATE Profiles SET nombre = ?, duration = ? where id = ?;",selParams, function(err, resultsData, fields) { if (err){throw err;}});
		for(var ii = 0; ii < req.body[i].mapa.length; ii++){
			var selMapaParams = [];
			if(req.body[i].mapa[ii].delete ==true)
			{
				selMapaParams = selMapaParams.concat([req.body[i].mapa[ii].id]);
				connection.query("DELETE FROM mapatemp where id = ?;",selMapaParams, function(err, resultsData, fields) { if (err){throw err;}});
			}else if(req.body[i].mapa[ii].insert ==true){
				console.log('-------------------insert---------------------');
				selMapaParams = selMapaParams.concat([req.body[i].id]);
				connection.query("INSERT INTO mapatemp (tempFrom, tempTo, temp, tolerancia, profile) values(0,0,0,0,?);",selMapaParams, function(err, resultsData, fields) { if (err){throw err;}});
			}else{
				selMapaParams = selMapaParams.concat([req.body[i].mapa[ii].tempFrom,req.body[i].mapa[ii].tempTo,req.body[i].mapa[ii].temp,req.body[i].mapa[ii].tolerancia,req.body[i].mapa[ii].id]);
				connection.query("UPDATE mapatemp SET tempFrom = ?, tempTo = ?, temp = ?, tolerancia = ? where id = ?;",selMapaParams, function(err, resultsData, fields) { if (err){throw err;}});
			}
		}
	}
	connection.end();
	res.json({'done':true});
});
app.use('/manageFerm.json', function (req, res, next) {

	var connection = mysql.createConnection(mysqlconfig);
	if(req.body.action == 'archivar')
	{
		var params = [];
		params = params.concat([req.body.id]);
		connection.query("update fermentadores set activo=0 where id = ?;",params, function(err, resultsData, fields) {
			if (err) 
			{
				throw err;
			}
		})
		connection.end();
	}
	if(req.body.action == 'delete')
	{
		var params = [];
		params = params.concat([req.body.id]);
		connection.query("delete from fermentadores where id = ?;",params, function(err, resultsData, fields) {
			if (err) 
			{
				throw err;
			}
		})
		connection.end();
	}
});

app.use('/getProfiles.json', function (req, res, next) {
	var connection = mysql.createConnection(mysqlconfig);
	connection.query("SELECT p.id,p.duration,p.nombre,mt.id as tId, mt.tempFrom, mt.tempTo, mt.temp, mt.tolerancia FROM profiles as p left join mapatemp as mt on p.id = mt.profile order by p.id;", function(err, resultsData, fields) {
		if (err) 
		{
			throw err;
		}
		if(resultsData.length>0){
			
			var currentId = resultsData[0].id ;
			var profiles = [];
			var tempMap=[];
			for(var i = 0; i <= resultsData.length; i++)
			{
				console.log((i +' vs '+ resultsData.length));
				
				console.log('currentId: '+ currentId);
				if(currentId != (i>=resultsData.length? 0 : resultsData[i].id))
				{
					currentId = i>=resultsData.length? currentId : resultsData[i].id ;
					var prof = {
						id: resultsData[i-1].id,
						nombre: resultsData[i-1].nombre,
						duration: resultsData[i-1].duration,
						mapa: tempMap
					}
					profiles.push(prof);
					tempMap=[];
				}
				if(i < resultsData.length)
				{
					
					var tp = {
						id: resultsData[i].tId,
						tempFrom: resultsData[i].tempFrom,
						tempTo: resultsData[i].tempTo,
						temp: resultsData[i].temp,
						tolerancia: resultsData[i].tolerancia
					}
					tempMap.push(tp);
				}
			}
			
			res.json(profiles);
		}
		});
		connection.end();
	});

app.use('/getTanques.json', function (req, res, next) {

	var selParams = [];
	var connection = mysql.createConnection(mysqlconfig);
	connection.query("SELECT * FROM tanques where id not in(select tanque from fermentadores where activo = 1);",selParams, function(err, resultsData, fields) {
		if (err) 
		{
			throw err;
		}
		
		var tanks = [];
		for(var i = 0; i < resultsData.length; i++)
		{
			
			var tanque = {
				id: resultsData[i].id,
				code: resultsData[i].code,
				descripcion: resultsData[i].descripcion,
			}
			tanks.push(tanque);
		}
		res.json(tanks);
				
	})
	connection.end();
	
});
app.use('/getFermData.json', function (req, res, next) {

	var q = url.parse(req.url, true).query;
	var selParams = [];
	console.log((q.activo=='1'?true:false));
	selParams = selParams.concat([(q.activo=='1'?true:false)]);
	var connection = mysql.createConnection(mysqlconfig);
	connection.query("select f.id as id, f.nombre as nombre_fermentacion ,p.nombre as profile , f.fecha_inicio as fecha_inicio, getHours(f.fecha_inicio) as total_hours, f.activo as activo, p.duration as duration, t.code as tanque_code, getLastTemp(f.id) as currentTemp, getProgTemp(f.id) as progTemp, getTempPromedio(f.id) as promTemp, t.descripcion as tanque_descripcion from fermentadores as f inner join profiles as p on f.profile = p.id inner join tanques as t on t.id = f.tanque where f.activo = ?;",selParams, function(err, resultsData, fields) {
		if (err) 
		{
			//throw err;
			console.log('ERROR SQL');
			console.log(err);
		}
		
		var ferms = [];
		for(var i = 0; i < resultsData.length; i++)
		{
			console.log(resultsData[i]);
			var ferm = {
				id: resultsData[i].id,
				nombre_fermentacion: resultsData[i].nombre_fermentacion,
				profile: resultsData[i].profile,
				tanque_code: resultsData[i].tanque_code,
				tanque_descripcion: resultsData[i].tanque_descripcion,
				total_hours: (resultsData[i].total_hours <= resultsData[i].duration ? resultsData[i].total_hours: resultsData[i].duration),
				duration : resultsData[i].duration,
				currentTemp: resultsData[i].currentTemp,
				progTemp: resultsData[i].progTemp,
				promTemp: resultsData[i].promTemp
			}
			ferms.push(ferm);
		}
		res.json(ferms);
				
	})
	connection.end();
	
});

app.use('/getSvg.svg', function (req, res, next) {
	var url = require('url');
	var mysqlconfig = require("./dbconfig.js").out;
	var d3 = require('d3');
	var techan = require('techan');
	var chart = require('./chart');
	var streams = require('memory-streams');
	var mysql = require('mysql');
	var csv = require("fast-csv");
	
	var queryData = url.parse(req.url, true).query;
	
	//get csv data
	var csvdatad3 = '';
	var queryData = url.parse(req.url, true).query;
	var params = [queryData.id];
	var csvconfig = {headers: true};
		
	var connection = mysql.createConnection(mysqlconfig);
	connection.connect();
	var query = "select * from registrotemp where fermentador = ?";
	
	connection.query(query, params, function(err, results, fields) {
		if (err) 
		{
			throw err;
		}
		var writer = new streams.WritableStream();
		var csvStream = csv.createWriteStream(csvconfig);
		csvStream.pipe(writer);
		var resultsData = results
		
		for(var i = 0; i < resultsData.length; i++)
		{
			var csvdata = resultsData[i];
			csvdata.date = csvdata.date.getFullYear() + "-" + (csvdata.date.getMonth() + 1) + "-" + csvdata.date.getDate() + " " + csvdata.date.getHours() + ":" + csvdata.date.getMinutes() + ":" + csvdata.date.getSeconds();
			csvStream.write(csvdata);
		}
		
		csvdatad3 = writer.toString()
		
		//console.log(csvdatad3)
		var csvData = d3.csvParse(csvdatad3.trim())//;
		//console.log(csvData)
		var document = require('jsdom').jsdom();
		
		var width = queryData.w;
		var height = queryData.h;
		var body = d3.select(document.body).call(chart(d3, techan, csvData, width, height));
		
		// Output result AVG
		res.header('Content-Type','image/svg+xml')
		res.write('<?xml version="1.0" encoding="utf-8"?>');
		res.write('<?xml-stylesheet type="text/css" href="/interface/svgCss.css" ?>');
		res.write('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
		res.write(body.html());
		res.end()
		//next();
	});
	connection.end();
});
//app.use("/", serveStatic('public'));
var server = app.listen(httpport);
			var selMapaParams = [];
