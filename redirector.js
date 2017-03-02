var express = require('express');
var os = require('os');
var app = express();
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
	app.get('*',function(req,res){  
		res.redirect('http://'+iface.address+':85/interface');
	})
	console.log('Listen on: ' + iface.address + ':80' );
    app.listen(80);
    ++alias;
  });
});
