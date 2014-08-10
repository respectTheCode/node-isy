"use strict";

var async = require("async");

module.exports = function (ISY) {
	var getVariableDefinitions = function (self, type, cb) {
		var typeName = type == 1 && "ints" || "states";
		if (self._cache[typeName].definitions) {
			return cb(null, self._cache[typeName].definitions);
		}

		self.request("/rest/vars/definitions/" + type, function (err, data) {
			var defs = data.CList.e;
			var varsById = self._cache[typeName].definitions = {};

			var i = defs.length;
			while (i--) {
				varsById[defs[i].$.id] = defs[i].$.name;
			}

			cb(null, varsById);
		});
	}

	var getVars = function (self, type, cb) {
		async.auto({
			definitions: async.apply(getVariableDefinitions, self, type),
			values: function (cb) {
				self.request("/rest/vars/get/" + type, cb);
			}
		}, function (err, results) {
			if (err) {
				return cb(err);
			}

			var varsById = results.definitions;
			var vals = results.values.vars.var;

			var vars = {};

			var i = vals.length;
			while (i--) {
				// skip unknown variables
				if (!varsById[vals[i].$.id]) continue;
				vars[varsById[vals[i].$.id]] = vals[i].val[0];
			}

			cb(null, vars);
		});
	}

	ISY.prototype.getIntegers = function (cb) {
		getVars(this, 1, cb);
	};

	ISY.prototype.getStates = function (cb) {
		getVars(this, 2, cb);
	};

	var setVariable = function (self, type, name, value, cb) {
		value = parseInt(value, 10);

		if (isNaN(value)) {
			return cb(new Error("Value not an integer"));
		}

		async.auto({
			definitions: async.apply(getVariableDefinitions, self, type),
			set: ["definitions", function (cb, results) {
				var id = false;

				for (var i in results.definitions) {
					if (results.definitions[i] == name) {
						id = i;
						break;
					}
				}

				if (id === false) {
					return cb(new Error("Variable not defined"));
				}

				self.request("/rest/vars/set/" + type + "/" + id + "/" + value, cb);
			}]
		}, function (err, results) {

			cb(err);
		});
	};

	ISY.prototype.setInteger = function (name, value, cb) {
		setVariable(this, 1, name, value, cb);
	};

	ISY.prototype.setState = function (name, value, cb) {
		setVariable(this, 2, name, value, cb);
	};
};
