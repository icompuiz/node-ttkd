define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentSignatureCtrl', ['$scope', '$log', '$state', '$stateParams', 'StudentSvc',
		function($scope, $log, $state, $stateParams, StudentSvc) {
			$scope.model = StudentSvc.current;

			if (!angular.isDefined($scope.model) || $scope.model == null) {
				$state.go("^", $stateParams);
			}

			// Make sure that the signature pad doesn't have any errosr
			function validateSigPadSigned() {
				if($scope.model.signaturedata.errors && $scope.model.signaturedata.errors != null) {
					return false;
				} else {
					return true;
				}
			}
			$scope.addValidationFunction(validateSigPadSigned);
		}
	]);

});
