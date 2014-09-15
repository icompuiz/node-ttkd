/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('ClassSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var ClassModel = ModelFactory.create('classes');

		return ClassModel;


	}]);

});