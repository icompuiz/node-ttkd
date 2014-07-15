'use strict';

var $fs = require('fs'),
	$async = require('async'),
	$config = require('./config.json'),
	$db = require('./db'),
	$security = require('./security');

function main(next, options) {

	function connectToDb(onDbConnected) {

		$db.parse($config, function(err, uri) {
			$db.connect(uri, null, function(err) {
				if (err) {
					return onDbConnected(err);
				}
				onDbConnected(null, uri);
			});
		}, options);


	}

	function parseSecurity(onSecurityParsed, options) {

		$security.parse($config, function(err, securityOptions) {
			onSecurityParsed(null, securityOptions);
		}, options);

	} 

	$async.series({
		security: parseSecurity,
		db: connectToDb,
	}, function(err, config) {
		module.exports.config = config;
		next(config);
	});

}

module.exports = {
	run: main
};

// main({}, function(err, config) {
// 	console.log(config);
// })

