define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentSignatureCtrl', ['$scope', '$log', '$state', '$stateParams', 'StudentSvc',
		function($scope, $log, $state, $stateParams, StudentSvc) {
			$scope.model = StudentSvc.current;

			if (!angular.isDefined($scope.model) || $scope.model == null) {
				$state.go("^", $stateParams);
			}

		}
	]);

});
