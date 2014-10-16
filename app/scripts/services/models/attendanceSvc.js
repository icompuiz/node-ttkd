/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('AttendanceSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var AttendanceModel = ModelFactory.create('attendance');

		return AttendanceModel;


	}]);

});