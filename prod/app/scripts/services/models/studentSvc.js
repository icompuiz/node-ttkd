/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('StudentSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var StudentModel = ModelFactory.create('students');

		return StudentModel;


	}]);

});