'use strict';

var $fs = require('fs'),
	$lodash = require('lodash'),
	$config = require('./config.json'),
	$db = require('./db');

function main(app, next) {

	function onDbConfigurationParsed(err, uri) {

		if (err) {
			throw new Error('Error parsing database configuration');
		} else  {
			connectToDb(uri, function() {});
		}

	}

	function connectToDb(uri) {

		$db.connect(uri, null, next);

	}


	$db.parse($config, onDbConfigurationParsed);

}

module.exports = main;

