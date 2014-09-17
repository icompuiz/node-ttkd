define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentEContactCtrl', ['$scope', '$log', '$state', 'StudentSvc','WizardService',
		function($scope, $log, $state, StudentSvc, WizardService) {
			$scope.relations = [
				'Mother', 'Mom', 'Dad', 'Father', 'Grandfather', 'Grandmother',
				'Brother', 'Sister'
			];

		}
	]);

});
