"use strict";

var async = require("async");

module.exports = function (ISY) {
	var propertyIdMap = {
		ST: "value",
		CLIMD: "mode",
		CLISPC: "coolTemp",
		CLISPH: "heatTemp",
		CLIHUM: "humidity"
	}

	var parseDevice = function (data) {
		var device = {
			name: data.name[0],
			enabled: data.enabled[0] == "true",
			status: data.property[0].$.formatted,
			value: data.property[0].$.value
		}

		var x = data.property.length;
		while (x--) {
			if (!propertyIdMap[data.property[x].$.id]) {
				continue;
			}
			device[propertyIdMap[data.property[x].$.id]] = data.property[x].$.formatted;
			device[propertyIdMap[data.property[x].$.id] + "Value"] = data.property[x].$.value;
		}

		return device;
	}

	ISY.prototype.getNodes = function (cb) {
		var self = this;

		self.request("/rest/nodes", function (err, data) {
			if (err) {
				return cb(err);
			}

			var nodes = data.nodes.node;

			var devicesByAddress = {};
			var scenesByAddress = {};

			var i = nodes.length;
			while (i--) {
				devicesByAddress[nodes[i].address[0]] = parseDevice(nodes[i]);
			}

			nodes = data.nodes.group;
			i = nodes.length;
			while (i--) {
				scenesByAddress[nodes[i].address[0]] = {
					name: nodes[i].name[0]
				}
			}

			cb(null, {devices: devicesByAddress, scenes: scenesByAddress});
		});
	};

	ISY.prototype.getDevice = function (address, cb) {
		var self = this;

		self.request("/rest/nodes/" + address, function (err, data) {
			if (err) {
				return cb(err);
			}

			var device = data.nodeInfo.node[0];
			var properties = data.nodeInfo.properties[0].property;

			var i = properties.length;
			while (i--) {
				device.property.push(properties[i]);
			}

			device = parseDevice(device);

			cb(null, device);
		});
	}
};
