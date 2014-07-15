var $express = require('express'),
	$path = require('path'),
	$lodash = require('lodash'),
	$passport = require('passport'),
	$config = require('./configuration/config.json'),
	$initialize = require('./configuration/initialize.js'),
	$mongoose = require('mongoose'),
	$fs = require('fs'),
	$argv = require('optimist').argv,
	LocalStrategy = require('passport-local').Strategy,
	$toastySession = require('./toastySession');

var MongoStore = require('connect-mongo')($express);

function main(app, config, argument2, argument3) {

	var options = {};
	var callback = function() {};
	
	if ($lodash.isFunction(argument2)) {
		callback = argument2;
	}

	if ($lodash.isObject(argument2)) {
		options = argument2;

		if ($lodash.isFunction(argument3)) {
			callback = argument3;
		}

	}


	module.exports.app = app;

	app.use($express.logger('dev'));

	app.use($express.cookieParser(config.security.cookieSecret));

	if (config.security.sessionStore) {
		config.security.sessionStore = new MongoStore({
			url: config.security.sessionStore
		});
	}

	app.use($express.session({
		key: config.security.sessionKey,
		secret: config.security.sessionSecret,
		store: config.security.sessionStore
	})); // get this from the configuration

	app.use($express.bodyParser({
		limit: '10mb'
	}));
	app.use($express.query());
	app.use($express.methodOverride());


	app.set('views', $path.join(__dirname,'..','app', 'views'));
	app.set('view engine', 'jade');
	app.set('view options', {
		layout: false
	});



	var modelsPath = $path.join(__dirname, 'models');
	$fs.readdirSync(modelsPath).forEach(function(file) {
		require($path.join(modelsPath, file));
	});

	var User = $mongoose.model('User');

	// setup $passport authentication
	app.use($passport.initialize());
	app.use($passport.session());

	app.use($express.static($path.join(__dirname, '..', '.tmp')));
	app.use($express.static($path.join(__dirname, '..', 'app')));
	app.use(app.router);


	$passport.use(new LocalStrategy(User.authenticate()));
	$passport.serializeUser(User.serializeUser());
	$passport.deserializeUser(User.deserializeUser());
	
	app.all('*',function (req, res, next) {
		
		if (!req.isAuthenticated()) {
			console.log('server::app.all::not authenticated::', 'setting current user to public');
			var userQuery = User.findOne({ username: 'public' });
			userQuery.select('_id username fullname');
			return userQuery.exec(function(err, user) {
				
				if (err || !user) {
					return res.send(500, 'Error finding public user. Request failed');
				}

				console.log('Making request as ', user.username);

				$toastySession.user = user;
				next();
			});
		}

		$toastySession.user = req.user;
		console.log('server::app.all::authenticated::', 'current user is', $toastySession.user.username);
		next();
	});


	function connect(err) {

		function onRoutesRegistered() {

			if (options.mode === 'test') {
				return callback(app);
			}

			if (!err) {
				var port = $config.port || 9000;
				app.listen(port, function() {
					console.log('Express server listening on port', port);
					return callback(app);
				});
			}
			
		}

		var $routes = require('./routes.js');
		$routes.register(app, onRoutesRegistered);
	}

	if (options.initialize || $argv.initdb) {
		console.log('toastyCMS::server::Load Data');
		var $loadData = require('./data/loadData');
		$loadData.run(connect);
	} else {
		connect();
	}
}

var app = $express();


module.exports = {
	run: function(onReady, options) {
		$initialize.run(function(config) {
			main(app, config, options, onReady);
		}, options);
	}
};