define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentSignatureCtrl', ['$scope', '$log', '$state', '$stateParams', 'StudentSvc',
		function($scope, $log, $state, $stateParams, StudentSvc) {
			$scope.model = StudentSvc.current;

			if (!angular.isDefined($scope.model) || $scope.model === null) {
				$state.go('^', $stateParams);
			}

			// Make sure that the signature pad doesn't have any errosr
			function validateSigPadSigned() {
				var onSignatureStep = /(students.create.signature)$/.test($scope.wizard.current.id);
				if($scope.wizard.current.isFinalStep || onSignatureStep) {
					if($scope.model.signaturedata.errors && $scope.model.signaturedata.errors !== null) {
						return false;
					}
				}

				return true;
			}

			$scope.addValidationFunction(validateSigPadSigned);
		}
	]);

});
