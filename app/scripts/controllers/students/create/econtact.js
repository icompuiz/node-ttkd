define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentEContactCtrl', ['$scope', '$log', '$state', '$stateParams', 'StudentSvc', 'EmergencyContactSvc', 'WizardService',
		function($scope, $log, $state, $stateParams, StudentSvc, EmergencyContactSvc, WizardService) {
			$scope.model = StudentSvc.current;

			if (!angular.isDefined($scope.model) || $scope.model == null) {
				$state.go("^", $stateParams);
			}

			$scope.relations = [
				'Mother', 'Mom', 'Dad', 'Father', 'Grandfather', 'Grandmother',
				'Brother', 'Sister'
			];



		}
	]);

});
