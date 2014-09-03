'use strict';
/**
 * Module dependencies.
 */
var $mongoose = require('mongoose'),
	Schema = $mongoose.Schema,
	$async = require('async'),
	$aclPlugin = require('../plugins/accessControlListsModel');

	
var routeSchema = new Schema({
	path: {
		type: String,
		required: true
	}
});

routeSchema.plugin($aclPlugin, {noadmin: true});

routeSchema.statics.whatResources = function(userId, callback) {

	var routes = {};

	var User = $mongoose.model('User');
	var Group = $mongoose.model('Group');
	var AccessControlEntry = $mongoose.model('AccessControlEntry');
	var AccessControlList = $mongoose.model('AccessControlList');

	var RouteModel = this;

	function addRoutes(aces, doneAdding) {

		$async.each(aces, function(ace, nextAcl) {

			AccessControlList.findOne({
				_id: ace.acl,
				'model.modelName': 'Route'
			}).populate('groupAccessControlEntries userAccessControlEntries').exec(function(err, acl) {

				if (err) {
					return	nextAcl(err);

				}
				if (acl) {

					RouteModel.findById(acl.model.id).exec(function(err, route) {

						if (err) {
							return	nextAcl(err);

						}

						if (!route) {
							err = new Error('Route object not found:' + acl.model.id);
							return	nextAcl(err);

						}

						routes[route.path] = true;

						nextAcl();
					});

				} else {
						return nextAcl();
				}

			});

		}, doneAdding);
	}


	User.findById(userId).exec(function(err, userDoc) {

		if (err) {
			return callback(err);
		}

		if (!userDoc) {
			err = new Error('User Not Found');
			return callback(err);
		}

		function handleGroups(afterHandleGroups) {

			Group.find({
				members: userDoc._id
			}).exec(function(err, groups) {

				if (err) {
					return callback(err);
				}

				$async.each(groups, function(groupDoc, nextGroup) {


					AccessControlEntry.find({
						group: groupDoc._id,
						$or: [{
							'access.read': true
						}, {
							'access.all': true
						}]
					}).exec(function(err, aces) {
						if (err) {
							return callback(err);
						}


						addRoutes(aces, nextGroup);

					});

				}, afterHandleGroups);


			});

		}

		function handleUser(afterHandleUser) {

			AccessControlEntry.find({
				user: userDoc._id
			}).exec(function(err, aces) {
				if (err) {
					return callback(err);
				}

				addRoutes(aces, afterHandleUser);

			});

		}

		$async.series([handleUser, handleGroups], function(err) {
			if (err) {
				return callback(err);
			}
			// routes = Object.keys(routes);
			callback(null, routes);
		});



	});


};

var Route = $mongoose.model('Route', routeSchema);

module.exports = Route;