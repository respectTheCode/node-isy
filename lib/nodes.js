"use strict";

var async = require("async");

module.exports = function (ISY) {
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
				devicesByAddress[nodes[i].address[0]] = {
					name: nodes[i].name[0],
					enabled: nodes[i].enabled[0] == "true",
					status: nodes[i].property[0].$.formatted,
					value: nodes[i].property[0].$.value
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
