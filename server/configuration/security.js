'use strict';

var	$db = require('./db'),
	$async = require('async'),
	_ = require('lodash');

var parseConfig = function(config, done) {

	var security = config.security;
	if (security) {
		var securityOptions = {};

		$async.series({
			cookieSecret: function(cookieSecretParsed) {
				if (security.cookieSecret) {
					var cookieSecret = security.cookieSecret.trim();
					if (cookieSecret) {
						cookieSecretParsed(null,cookieSecret);
					} else {
						var error = new Error('Cookie Secret must be set in configuration/config.js::security.cookieSecret');
						cookieSecretParsed(error);

					}
				} else {
					var error = new Error('Cookie Secret must be set in configuration/config.js::security.cookieSecret');
					cookieSecretParsed(error);
				}

			},
			sessionKey: function(sessionKeyParsed) {
				if (security.sessionKey) {
					var sessionKey = security.sessionKey.trim();
					if (sessionKey) {
						sessionKeyParsed(null,sessionKey)
					} else {
						var error = new Error('Session Key must be set in configuration/config.js::security.sessionKey');
						sessionKeyParsed(error);
					}
				} else {
					var error = new Error('Session Key must be set in configuration/config.js::security.sessionKey');
					sessionKeyParsed(error);
				}
				
			},
			sessionSecret: function(sessionSecretParsed) {
				if (security.sessionSecret) {
					var sessionSecret = security.sessionSecret.trim();
					if (sessionSecret) {
						sessionSecretParsed(null, sessionSecret);
					} else {
						var error = new Error('Session Secret must be set in configuration/config.js::security.sessionSecret');
					}
				} else {
					var error = new Error('Session Secret must be set in configuration/config.js::security.sessionSecret');
				}
			},
			sessionStore: function (sessionStoreParsed) {
				if (_.isObject(security.sessionStore)) {
					var sessionStore = {
						db: security.sessionStore
					};
					$db.parse(sessionStore, sessionStoreParsed);
				} else {
					sessionStoreParsed();
				}
			}
		}, function(err, securityOptions) {
			if (err) {
				done(err)
			}
			done(null, securityOptions);
		})

	} else {
		done(new Error('System security options not set. Set them in configuration/config.js::security'));

	}

};

module.exports = {
	parse: parseConfig,
};

// parseConfig(require('./config.json'), function(err, config) {
// 	console.log(config);
// })