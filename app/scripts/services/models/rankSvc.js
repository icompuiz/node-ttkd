/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('RankSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var RankModel = ModelFactory.create('ranks');

		return RankModel;


	}]);

});