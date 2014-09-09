/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('StudentSvc', ['EndpointFactory','ModelFactory', function(EndpointFactory,ModelFactory) {

		// privates
		var StudentModel = ModelFactory.create('students');

		return StudentModel;


	}]);

});