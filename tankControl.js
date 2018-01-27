var SerialPort = require('serialport');
var mysqlconfig = require("./dbconfig.js").out;
var mysql = require('mysql');


var readyToSerialWrite = false;
var tanks = [];
var checkingFerms = false;
setInterval(function(){
	try{
		if(readyToSerialWrite){
			
			if(tanks.length==0){
				console.log('----------INICIO DEL LOOP-----------------');
				getFermentadores();
			}else{
				if(!checkingFerms){
					checkFerms();
				}
			}
		}
	}catch(err)
	{
		console.log('Error: ' + err.message);		
	}
},5000);
initializePort();

//functions
var port = null;
function checkFerms(){
	try{
		console.log('---------------Chequear los tanks-----------------------');
		console.log(tanks);
		checkingFerms=true;
		var COUNT_LOOPS = 20;
		var waitLoops = COUNT_LOOPS;
		
		var thisInter =  setInterval(function(){
			var clearArray=true;
			for(var i = 0; i < tanks.length; i++)
			{
				if(tanks[i].status == 'pending')
				{
					tanks[i].status = 'waiting';
					setTimeout(function(){writePort(tanks[i].tanque_code)},2000);
					clearArray = false;
					waitLoops = COUNT_LOOPS;
					break;
					
				}
				else if(tanks[i].status == 'waiting')
				{
					clearArray = false;
					break;
				}
			}
			if(clearArray || waitLoops<=0)			
			{
				checkingFerms=false;
				tanks = [];
				clearInterval(thisInter);
				if(waitLoops<=0){
					console.log('Waiting timeout...');
				}
			}
			waitLoops--;
		},500);
	}catch(err)
	{
		console.log('Error: ' + err.message);		
	}
}

function writePort(argTankCode){
	console.log('Writting: ' +argTankCode+'t' );
	port.flush();
	port.write(Buffer.from(argTankCode+'t'), function(err){
		if(err){
			console.log('Error on write: ' + err.message );
		}
	});
}
function initializePort(){
		var connection = mysql.createConnection(mysqlconfig);
		connection.query('SELECT * FROM configs LIMIT 1;',function(err, results, fields) {
			try{
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
						if(data.toString().startsWith('{')){
							analizeTank(JSON.parse(data.toString().replace(/\n/,'').replace(/\r/,'')));
						}	
					}
					port.flush();
			});
			}catch(err)
			{
				console.log('Error: ' + err.message);
				initializePort()
			}
		})
		connection.end();
}

function analizeTank(obj)
{
	for(var i = 0; i < tanks.length; i++)
	{
		if(tanks[i].tanque_code == obj.f)
		{
			tanks[i].status = 'done';
			break;
		}
	}
	if(obj.f.startsWith('tank'))
	{
		var insParams = [];
		var getTempParams = [];
		var connection = mysql.createConnection(mysqlconfig);
		getTempParams = getTempParams.concat([obj.f,obj.f,obj.f,obj.f]);
		var selTempProgQry ="SELECT getProgTemp(getFermentadorFormTanqueCurrent(?)) as temp, getProgTempTolerancia(getFermentadorFormTanqueCurrent(?)) as tolerancia, getTempCalibration(?) as cal, getAlertaByFermentador(getFermentadorFormTanqueCurrent(?)) as alerta;"
		connection.query(selTempProgQry,getTempParams,function(err, results, fields) {
			if (err) 
			{
				throw err;
			}
			var r = results[0];
			var tankTemp = obj.t + r.cal;
			var progTemp = r.temp ;
			//Inserta los valores corregidos en la BDD
			var insQry = "call insertTempReg(getFermentadorFormTanqueCurrent(?),?);";
			insParams = insParams.concat([obj.f,tankTemp]);
			var conn2 = mysql.createConnection(mysqlconfig);
			conn2.query(insQry,insParams,function(err, resultsData, fields) {})
			conn2.end();
			//chequea las alertas aca abajo antes de enviar datos al arduino para saber si debe apagar algo
			//zona
			//los obj.r estan al reves, porque los relays funcionan al reves...
			var error = false;
			switch(r.alerta)
			{
				case '000ps'://error bomba atascada
					error = true;
					//apaga la bomba
					port.write('pmpOff');
				break;
				case '000fc'://error descenso de temperatura en ferms
					error = true;
					//apaga la bomba
					port.write('pmpOff');
					//intenta cerrar la valvula nuevamente
					//con delay para esperar al arduino
					setTimeout(function(){if(obj.r == 0 ){port.write(obj.f+'r0');}},1000);
					
				break;
				
			}
			if(error)
			{
				console.log('-----------ALERTA------------');
				console.log(r.alerta);
				console.log('-----------------------------');
			}
			//Chequeo de temperatura
			var progTolerancia = r.tolerancia;
			console.log("temp real: " + obj.t + " tol: " + r.tolerancia + " cal: " + r.cal); 
			console.log("temp calibrada: " + tankTemp);
			//los obj.r estan al reves, porque los relays funcionan al reves...
			var tempRef = obj.r == 1 ? progTemp: progTemp-progTolerancia;
			console.log("temp ref: " + tempRef);
			if(progTemp==0)console.log("No hay valor de temperatura de referencia en el perfil!!");
			if(!error && progTemp > 0){
				//los obj.r estan al reves, porque los relays funcionan al reves...
				if(tankTemp>tempRef)
				{
					if(obj.r == 1 ){
						port.write(obj.f+'r');
						console.log("Turn On R: " + obj.f);
					}
				}else
				{
					if(obj.r == 0 ){
						port.write(obj.f+'r');
						console.log("Turn Off R: " + obj.f);
					}
				}
			}
		})
		connection.end();
		//checkFailures(obj);
	}else if(obj.f.startsWith('bf'))
	{
		var connection = mysql.createConnection(mysqlconfig);
		var selTempProgQry ="SELECT refritemp, tolerancia FROM configs;"
		connection.query(selTempProgQry,function(err, results, fields) {
			if (err) 
			{
				throw err;
			}
			var r = results[0];
			
			var progTemp = r.refritemp;
			var tankTemp = obj.t; 
			
			var updateParams = [];
			var updQry = "UPDATE bancofrio SET temperatura = ? WHERE code =?;";
			updateParams = updateParams.concat([obj.t,obj.f]);
			var conn2 = mysql.createConnection(mysqlconfig);
			conn2.query(updQry,updateParams,function(err, resultsData, fields) {})
			conn2.end();
			
			//Chequeo de temperatura
			var progTolerancia = r.tolerancia;
			//los obj.r estan al reves, porque los relays funcionan al reves...
			var tempRef = obj.r == 1 ? progTemp: progTemp-progTolerancia;
			if(tankTemp>tempRef)
			{
				if(obj.r == 1 ){
					port.write(obj.f+'r');
					console.log("Turn On R: " + obj.f);
				}
			}else
			{
				if(obj.r == 0 ){
					port.write(obj.f+'r');
					console.log("Turn Off R: " + obj.f);
				}
			}
		})
		connection.end();
	}
	
}
function checkFailures(obj){
		
		var getTempParams = [];
		var connection = mysql.createConnection(mysqlconfig);
		getTempParams = getTempParams.concat([obj.f,obj.f,obj.f]);
		var selTempProgQry ="SELECT checkTempErrorTooCold(getFermentadorFormTanqueCurrent(?)) as fc, checkTempErrorNotCooling(getFermentadorFormTanqueCurrent(?)) as ps, getAlertaByFermentador(getFermentadorFormTanqueCurrent(?)) as currentAlerta;"
		connection.query(selTempProgQry,getTempParams,function(err, results, fields) {
			if (err) 
			{
				throw err;
			}
			var r = results[0];
			var error='00000';
			if(r.ps==1 || r.fc==1){
				console.log('hay error!');
				if(r.ps==1){
					error='000ps';
				}else if(r.fc==1)
				{
					error='000fc';
				}
				var params = [];
				params = params.concat([error, obj.f]);
				var qry = "UPDATE fermentadores SET alerta = (SELECT id FROM alertas WHERE code = ?) WHERE getFermentadorFormTanqueCurrent(?);";
				var conn2 = mysql.createConnection(mysqlconfig);
				conn2.query(qry,params,function(err, resultsData, fields) {})
				conn2.end();
			}else
			{
				
				if(r.currentAlerta!='00000'){
					console.log('---------ALERTA ACTUAL----------');
					console.log(r.currentAlerta);
					var params = [];
					params = params.concat([obj.f]);
					var qry = "UPDATE fermentadores SET alerta = 0 WHERE getFermentadorFormTanqueCurrent(?);";
					var conn2 = mysql.createConnection(mysqlconfig);
					conn2.query(qry,params,function(err, resultsData, fields) {})
					conn2.end();
					
				}
				
			}
		})
		connection.end();
}
function getFermentadores(){
	var connection = mysql.createConnection(mysqlconfig);
	var qry="SELECT f.id as id, t.code as tanque_code, ifnull(a.code,'00000') as alerta FROM fermentadores as f inner join profiles as p on f.profile = p.id inner join tanques as t on t.id = f.tanque left join alertas as a on f.alerta = a.id WHERE f.activo = 1 and getHours(f.fecha_inicio) <= p.duration;";
	connection.query(qry, function(err, resultsData, fields) {
		try{
			if (err) 
			{
				throw err;
			}
			//console.log(resultsData)
			tanks.push({id:0,tanque_code:'bf1', alerta:'00000', status : 'pending'});
			for(var i = 0; i < resultsData.length; i++)
			{
				var ferm = {
					id: resultsData[i].id,
					tanque_code: resultsData[i].tanque_code,
					alerta: resultsData[i].alerta,
					status : 'pending'
				}
				tanks.push(ferm);
			}
		}catch(err)
		{
			console.log('Error: ' + err.message);		
		}
	})
	connection.end();
	
}

