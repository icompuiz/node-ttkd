/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('ProgramSvc', ['EndpointFty','ModelFty', function(EndpointFactory,ModelFty) {

		// privates
		var ProgramEnpoint = EndpointFactory.create('programs');
		var ProgramModel = ModelFty.create(ProgramEnpoint);

		return ProgramModel;


	}]);

});