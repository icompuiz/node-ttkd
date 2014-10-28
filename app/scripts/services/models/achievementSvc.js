/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('AchievementSvc', ['ModelFactory', function(ModelFactory) {

		// privates
		var AttendanceModel = ModelFactory.create('achievements');

		return AttendanceModel;
	}]);

});