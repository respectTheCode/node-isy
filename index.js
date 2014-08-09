"use strict";

var http = require("http");
var xml2js = require("xml2js");
var async = require("async");

var ISY = module.exports = function (options) {
	this._options = options;
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

ISY.prototype.getVars = function (type, cb) {
	var self = this;

	async.auto({
		definitions: function (cb) {
			self.request("/rest/vars/definitions/" + type, cb);
		},
		values: function (cb) {
			self.request("/rest/vars/get/" + type, cb);
		}
	}, function (err, results) {
		if (err) {
			return cb(err);
		}

		var defs = results.definitions.CList.e;
		var vals = results.values.vars.var;

		var varsById = {};
		var vars = {};

		var i = defs.length;
		while (i--) {
			varsById[defs[i].$.id] = defs[i].$.name;
		}

		i = vals.length;
		while (i--) {
			vars[varsById[vals[i].$.id]] = vals[i].val[0];
		}

		cb(null, vars);
	});
}

ISY.prototype.getIntegers = function (cb) {
	this.getVars(1, cb);
};

ISY.prototype.getStates = function (cb) {
	this.getVars(2, cb);
};
