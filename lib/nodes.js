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
				var device = devicesByAddress[nodes[i].address[0]] = {
					name: nodes[i].name[0],
					enabled: nodes[i].enabled[0] == "true",
					status: nodes[i].property[0].$.formatted,
					value: nodes[i].property[0].$.value
				}

				var x = nodes[i].property.length;
				while (x--) {
					device[propertyIdMap[nodes[i].property[x].$.id]] = nodes[i].property[x].$.formatted;
					device[propertyIdMap[nodes[i].property[x].$.id] + "Value"] = nodes[i].property[x].$.value;
				}
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
};
