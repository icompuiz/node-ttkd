define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentClassCtrl', ['$scope', '$log', '$state', 'StudentSvc',
		function($scope, $log, $state, StudentSvc) {
			$log.log($scope.model);

		}
	]);

});
