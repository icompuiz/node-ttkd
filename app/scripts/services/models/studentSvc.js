/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('StudentSvc', ['EndpointFty','ModelFty', function(EndpointFactory,ModelFty) {

		// privates
		var StudentEnpoint = EndpointFactory.create('students');
		var StudentModel = ModelFty.create(StudentEnpoint);

		return StudentModel;


	}]);

});