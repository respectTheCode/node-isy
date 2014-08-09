"use strict";

var http = require("http");
var xml2js = require("xml2js");
var async = require("async");

var ISY = module.exports = function (options) {
	this._options = options;
	this._cache = {ints: {}, states: {}, devices: {}, scenes: {}};
};

ISY.prototype.request = function (path, cb) {
	var req = http.request({
		host: this._options.host,
		port: this._options.port || 80,
		path: path,
		auth: this._options.user + ':' + this._options.pass
	}, function (res) {
		var data = "";
		var finished = false;

		res.setEncoding('utf8');
		res.on("data", function (chunk) {
			data += chunk;
		});

		res.on("end", function () {
			// don't call the callback twice
			if (finished) return;
			finished = true;

			xml2js.parseString(data, function (err, json) {
				cb(err, json);
			});
		});

		res.on("error", function (err) {
			if (finished) return;
			finished = true;
			cb(err);
		});
	});

	req.end();
};

require("./lib/variables")(ISY);
require("./lib/nodes")(ISY);
