/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('ClassSvc', ['EndpointFactory','ModelFactory', function(EndpointFactory,ModelFactory) {

		// privates
		var ClassModel = ModelFactory.create('classes');

		return ClassModel;


	}]);

});