/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('RankSvc', ['EndpointFactory','ModelFactory', function(EndpointFactory,ModelFactory) {

		// privates
		var RankModel = ModelFactory.create('ranks');

		return RankModel;


	}]);

});