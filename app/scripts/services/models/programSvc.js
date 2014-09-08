/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('ProgramSvc', ['EndpointFactory','ModelFactory', function(EndpointFactory,ModelFactory) {

		// privates
		var ProgramModel = ModelFactory.create('programs');

		return ProgramModel;


	}]);

});