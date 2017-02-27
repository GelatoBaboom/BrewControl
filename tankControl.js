var SerialPort = require('serialport');
var mysqlconfig = require("./dbconfig.js").out;
var mysql = require('mysql');
/* SerialPort.list(function (err, ports) {
	ports.forEach(function(port) {
		console.log(port.comName);
		console.log(port.pnpId);
		console.log(port.manufacturer);
	});
}); */

var readyToSerialWrite = false;

setInterval(function(){
	if(readyToSerialWrite){
		checkFermentadores();
	}
},5000);
initializePort();

//functions
var port = null;
function initializePort(){
	var connection = mysql.createConnection(mysqlconfig);
	connection.query('SELECT * FROM configs LIMIT 1; ',function(err, results, fields) {
		if (err) 
		{
			throw err;
		}
		var COM_PORT = results[0].comport;
		port = new SerialPort(COM_PORT, { autoOpen: true, baudRate: 9600 });

		port.on('data', function (data) {
			if(data.toString().match(/ready/i)){
				readyToSerialWrite  = true;
				console.log('Port: ' + data.toString());
				//linea de abajo solo test
				
			}else{
				console.log('Data: ' + data.toString());
				analizeTank(JSON.parse(data.toString().replace(/\n/,'').replace(/\r/,'')));
			}
			port.flush();
				
		});
	})
	connection.end();
}
function analizeTank(obj)
{
	var insParams = [];
	var getTempParams = [];
	var connection = mysql.createConnection(mysqlconfig);
	
	
	getTempParams = getTempParams.concat([obj.f,obj.f,obj.f]);
	var selTempProgQry ="select getProgTemp(getFermentadorFormTanqueCurrent(?)) as temp, getProgTempTolerancia(getFermentadorFormTanqueCurrent(?)) as tolerancia, getTempCalibration(?) as cal;"
	connection.query(selTempProgQry,getTempParams,function(err, results, fields) {
		if (err) 
		{
			throw err;
		}
		
		
		var r = results[0];
		var progTemp = obj.t + r.cal;
		//Inserta los valores corregidos en la BDD
		var insQry = "call insertTempReg(getFermentadorFormTanqueCurrent(?),?);";
		insParams = insParams.concat([obj.f,progTemp]);
		var conn2 = mysql.createConnection(mysqlconfig);
		conn2.query(insQry,insParams,function(err, resultsData, fields) {})
		conn2.end();
		
		//Chequeo de temperatura
		var progTolerancia = r.tolerancia;
		console.log("temp map: " + obj.t + " tol: " + r.tolerancia);
		var tempRef = obj.r == 0 ? progTemp: progTemp-progTolerancia;
		console.log("temp ref: " + tempRef);
		if(obj.t>tempRef)
		{
			if(obj.r == 0 ){
				port.write(obj.f+'r0');
				console.log("Turn On R: " + obj.f);
			}
		}else
		{
			if(obj.r == 1 ){
				port.write(obj.f+'r0');
				console.log("Turn Off R: " + obj.f);
			}
		}
		

	})
	connection.end();
	
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
	
	var connection = mysql.createConnection(mysqlconfig);
	connection.query("select f.id as id, f.nombre as nombre_fermentacion ,p.nombre as profile , f.fecha_inicio as fecha_inicio, getHours(f.fecha_inicio) as total_hours, f.activo as activo, p.duration as duration, t.code as tanque_code, getLastTemp(f.id) as currentTemp, t.descripcion as tanque_descripcion from fermentadores as f inner join profiles as p on f.profile = p.id inner join tanques as t on t.id = f.tanque where f.activo = 1 and getHours(f.fecha_inicio) <= p.duration;", function(err, resultsData, fields) {
		if (err) 
		{
			throw err;
		}
		//console.log(resultsData)
		var ferms = [];
		for(var i = 0; i < resultsData.length; i++)
		{
			console.log('Writting: ' +resultsData[i].tanque_code+'t' );
			port.write(resultsData[i].tanque_code+'t', function(err){
				if(err){
					console.log('Error on write: ' + err.message );
				}
			});
			//el obj de abajo esta al cuete!
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
		
				
	})
	connection.end();
}