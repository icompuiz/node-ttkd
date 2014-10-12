define(['../module'], function(controllers){
	'use strict';
	controllers.controller('CreateWorkshopCtrl', ['$scope', '$state', 'WorkshopSvc', 
		function($scope, $state, WorkshopSvc) {
			$scope.workshopTime = new Date();

			$scope.workshop = {
				attendanceList: []
			};

			// Collect workshop names so we can validate new workshop name
			$scope.getWorkshops = function(){
				WorkshopSvc.list().then(function(workshops) {
					$scope.workshopNames = _.map(workshops, function(w){return w.name;});
				});
			};
			$scope.getWorkshops();

			if (WorkshopSvc.current && WorkshopSvc.creating) {
				$scope.workshop = WorkshopSvc.current;
			} else {
				WorkshopSvc.init($scope.workshop);
			}

			$scope.backToWorkshops = function() {
				WorkshopSvc.reset();
				$state.go('admin.workshops.home');
			};

			$scope.createWorkshop = function() {
				// Add time to date object
				$scope.workshop.workshopDate.setHours($scope.workshopTime.getHours());
				$scope.workshop.workshopDate.setMinutes($scope.workshopTime.getMinutes());

				var workshopToAdd = {
					name: $scope.workshop.name,
					attendanceList: $scope.workshop.attendanceList,
					workshopDate: $scope.workshop.workshopDate
				};

				WorkshopSvc.init(workshopToAdd);
				WorkshopSvc.create(false).then(function(added) {
					$scope.backToWorkshops();
				});
			};

/******* Datepicker **********************************************/

			$scope.today = function() {
				$scope.workshop.workshopDate = new Date();
			};

			$scope.clear = function() {
				$scope.workshop.workshopDate = null;
			};

			$scope.openDatepicker = function($event) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.today();
				$scope.dpOpened = true;
			};

			$scope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};
			$scope.initDate = new Date('2014-01-01');
			$scope.format = 'MMMM dd, yyyy';

/******* Timepicker **********************************************/
			
			$scope.clearTime = function() {
				$scope.time = {};
			}

/********************** Form Validation **********************************/
			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canSaveWorkshop = function() {
				return !$scope.isEmpty($scope.workshop.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				return _.contains($scope.workshopNames, $scope.workshop.name);
			};

	}]);
});	