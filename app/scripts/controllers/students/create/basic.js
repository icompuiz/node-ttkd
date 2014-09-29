define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentBasicCtrl', ['$scope', '$log', '$state', '$stateParams', 'StudentSvc',
		function($scope, $log, $state, $stateParams, StudentSvc) {

			$scope.model = StudentSvc.current;

			if (!angular.isDefined($scope.model) || $scope.model == null) {
				$state.go("^", $stateParams);
			}

			// Date of birth calendar
			$scope.today = function() {
					$scope.model.birthday = new Date();
			};
			//$scope.today();
			$scope.clear = function() {
					$scope.model.birthday = null;
			};
			$scope.open = function($event) {
					$event.preventDefault();
					$event.stopPropagation();
					$scope.opened = true;
			};

			$scope.dateOptions = {
					formatYear: 'yy',
					startingDay: 1
			};
			$scope.initDate = new Date('2014-01-01');
			$scope.format = 'MMMM dd, yyyy';
			$scope.states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
			'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
			'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
			'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI',
			'WY'];
			$scope.defaultState = 'NY';

			function validateData() {
				return validateFirstName() && validateLastName();
			}

			function validateFirstName() {
				var firstName = $scope.model.firstName;

				if(firstName.length < 2 || firstName.length > 64) {
					$scope.errors.basic.firstName = 'First name must be between 2 and 64 characters long.';
					return false;
				}
			}

			function validateLastName() {
				var lastName = $scope.model.lastName;

				if(lastName.length < 2 || lastName.length > 64) {
					$scope.errors.basic.lastName = 'Last name must be between 2 and 64 characters long.';
					return false;
				}
			}

			function validateAddress() {
				var street = $scope.model.address.street;
				var city = $scope.model.address.city;
				var state = $scope.model.address.state;

				if(street.length < 2 || lastName.length > 128) {
					$scope.errors.basic.address.street = 'Street address must be between 2 and 128 characters long.';
					return false;
				}
			}
		}
	]);

});
