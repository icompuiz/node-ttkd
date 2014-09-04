define(['../module'], function(controllers) {

		controllers.controller('StudentsCtrl', ['$scope', '$http', '$log', '$state', 'AuthenticationSvc',
				function($scope, $http, $log, $state, AuthenticationSvc) {

						$scope.firstnamehelp = "First name!";
						$scope.lastnamehelp = "Last name!";
						$scope.emailhelp = "Email!";

						$scope.today = function() {
								$scope.dt = new Date();
						};
						$scope.today();

						$scope.clear = function() {
								$scope.dt = null;
						};

						// Disable weekend selection
						$scope.disabled = function(date, mode) {
								return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
						};

						$scope.toggleMin = function() {
								$scope.minDate = $scope.minDate ? null : new Date();
						};
						$scope.toggleMin();

						$scope.open = function($event) {
								$event.preventDefault();
								$event.stopPropagation();

								$scope.opened = true;
						};

						$scope.dateOptions = {
								formatYear: 'yy',
								startingDay: 1
						};

						$scope.initDate = new Date('2016-15-20');
						$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
						$scope.format = $scope.formats[0];


				}
		]);

});
