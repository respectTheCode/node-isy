# node-isy

A wrapper for the ISY REST APIs

http://wiki.universal-devices.com/index.php?title=ISY_Developers:API:REST_Interface

## Usage


	var ISY = require("isy");
	
	var isy = new ISY({
		host: "192.168.1.10",
		user: "admin",
		pass: "admin"
	});
	
	isy.getIntegers(function (err, data) {
		console.log("ints", err, data);
	});
	
	isy.getStates(function (err, data) {
		console.log("states", err, data);
	});

