var SerialPort = require('serialport');
	
/* SerialPort.list(function (err, ports) {
	ports.forEach(function(port) {
		console.log(port.comName);
		console.log(port.pnpId);
		console.log(port.manufacturer);
	});
}); */
var serialData='';
var readyToWrite = false;

var port = new SerialPort('COM3', { autoOpen: true, baudRate: 9600 });
port.on('data', function (data) {
	if(data.toString().match(/ready/i)){
		readyToWrite = true;
		console.log('Port: ' + data.toString());
		checkFermentadores();
	}else{
		console.log('Data: ' + data.toString());
		analizeTank(JSON.parse(data.toString().replace(/\n/,'').replace(/\r/,'')));
	}
	port.flush();
		
});

function analizeTank(obj)
{
	console.log('resp fowarded');
	console.log(obj.t);
	
}
/*port.on('close', function (data) {
	port.open();
});*/
/*while(!readyToWrite)
{
	console.log('waiting..');
	if(readyToWrite)
	port.write('f1');
}*/
function checkFermentadores(){
	var mysqlconfig = require("./dbconfig.js").out;
	var mysql = require('mysql');
	
	
	var connection = mysql.createConnection(mysqlconfig);
	connection.query("select f.id as id, f.nombre as nombre_fermentacion ,p.nombre as profile , f.fecha_inicio as fecha_inicio, getHours(f.fecha_inicio) as total_hours, f.activo as activo, p.duration as duration, t.code as tanque_code, getLastTemp(f.id) as currentTemp, t.descripcion as tanque_descripcion from fermentadores as f inner join profiles as p on f.profile = p.id inner join tanques as t on t.id = f.tanque where f.activo = 1;", function(err, resultsData, fields) {
		if (err) 
		{
			throw err;
		}
		//console.log(resultsData)
		var ferms = [];
		for(var i = 0; i < resultsData.length; i++)
		{
			port.write(resultsData[i].tanque_code);
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
		
		}
		
				
	});
}