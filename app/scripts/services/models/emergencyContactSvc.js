/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('EmergencyContactSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var EmergencyContactModel = ModelFactory.create('emergencycontacts');

		return EmergencyContactModel;


	}]);

});