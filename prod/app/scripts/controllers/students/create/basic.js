define(['../../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentBasicCtrl', ['$scope', '$log', '$filter', '$state', '$stateParams', 'StudentSvc',
		function($scope, $log, $filter, $state, $stateParams, StudentSvc) {

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

			if(!$scope.model.address) {
				$scope.model.address = {};
				$scope.model.address.state = $scope.defaultState;
			}

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

			//add support for multiple email addresses
			if(!$scope.model.emailAddresses) {
				$scope.model.emailAddresses = [];
			}

			var allEmails = _.clone($scope.model.emailAddresses);
			$scope.model.primaryEmailAddress = allEmails[0];
			$scope.model.additionalEmailAddresses = allEmails;
			$scope.model.additionalEmailAddresses.splice(0,1);
			$scope.additionalEmailAddressesIndices = [];

			for(var i=0; i<$scope.model.additionalEmailAddresses.length; i++) {
				$scope.additionalEmailAddressesIndices[i] = i;
			}

			$scope.insertNewEmail = function() {
				$scope.additionalEmailAddressesIndices.push($scope.additionalEmailAddressesIndices.length);
			};

			$scope.removeEmail = function(index) {
				$log.log('removing additional email field with index:' + index);
				$scope.additionalEmailAddressesIndices.splice($scope.additionalEmailAddressesIndices.length-1, 1);
				$scope.model.additionalEmailAddresses.splice(index, 1);
			};

			$scope.$watchCollection('model.additionalEmailAddresses', function(newNames, oldNames) {
				performEmailChange(newNames);
  			});

			$scope.$watch('model.primaryEmailAddress', function(newNames, oldNames) {
				performEmailChange(newNames);
  			});

  			function performEmailChange(newNames) {
    			$scope.model.emailAddresses = [];
    			$scope.model.emailAddresses.push($scope.model.primaryEmailAddress);
    			$scope.model.emailAddresses = $scope.model.emailAddresses.concat(newNames);
    			$log.log($scope.model.emailAddresses);
  			}
		}
	]);

});
