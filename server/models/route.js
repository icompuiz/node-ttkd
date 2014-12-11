'use strict';
/**
 * Module dependencies.
 */
var $mongoose = require('mongoose'),
	Schema = $mongoose.Schema,
	$async = require('async'),
	_ = require('lodash'),
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
	
	var RouteModel = this;

	RouteModel.find().exec(function(err, routeDocs) {

		$async.filter(routeDocs, function(routeDoc, filterRouteDocTaskDone) {

			routeDoc.isAllowed('read', function(err, isAllowed) {

				filterRouteDocTaskDone(isAllowed);

			});

		}, function(routeDocsFiltered) {


			_.forEach(routeDocsFiltered, function(routeDoc) {
				routes[routeDoc.path] = true;
			});

			callback(null, routes);

		});

	});



};

var Route = $mongoose.model('Route', routeSchema);

module.exports = Route;