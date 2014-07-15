'use strict';

var $mongoose = require('mongoose'),
	$util = require('util'),
	$lodash = require('lodash'),
	$async = require('async');

/**
 * Parse the system configuration object for relvant configuration settings
 * In this case they are the database options
 */
var parseConfig = function(config, onParsed, options) {


	var db = config.db;
	
	if (options && options.useDb) {
		db = config[options.useDb] || db;
	}

	if (db) {

		var uri = ['mongodb://'];

		if (db.username) {
			var username = db.username.trim();
			var password = db.password.trim();
			var usernameFormat = '%s:%s@';
			username = $util.format(usernameFormat, username, password);
			uri.push(username);
		}

		if (db.hostname) {
			var hostname = db.hostname.trim();
			uri.push(hostname);
		} else {
			uri.push('localhost');

		}

		if (db.port) {
			var port = db.port.trim();
			var portFormat = ':%d';
			port = $util.format(portFormat, port);
			uri.push(port);
		}

		if (db.database) {
			var database = db.database.trim();
			var databaseFormat = '/%s';
			database = $util.format(databaseFormat, database);
			uri.push(database);
		}  else {
			uri.push('/toastydb');

		}

		if (db.options) {
			var options = db.options.trim();
			var optionsFormat = '?%s';
			options = $util.format(optionsFormat, options);
			uri.push(options);
		}

		uri = uri.join('');

		onParsed(null, uri);
		
	} else {
		var error = new Error('Error parsing database configuration');
		onParsed(error);
	}

};

var connect = function(uri, mongoOptions, onConnect) {
	$mongoose.connect(uri, mongoOptions, function (err, res) {
		if (err) {
			onConnect(err);
		} else {
			onConnect(null, res);
		}
	});
};

module.exports = {
	parse: parseConfig,
	connect: connect
};