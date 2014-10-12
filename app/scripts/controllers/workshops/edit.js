define(['../module'], function(controllers){
	'use strict';
	controllers.controller('EditWorkshopCtrl', ['$scope', '$state', '$stateParams', 'WorkshopSvc', 
		function($scope, $state, $stateParams, WorkshopSvc) {

			$scope.workshop = {
				attendanceList: []
			};

			// Collect workshop names so we can validate new workshop name
			$scope.getWorkshops = function(){
				WorkshopSvc.list().then(function(workshops) {
					$scope.workshopNames = _.map(workshops, function(w){return w.name;});
					$scope.workshopNames = _.without($scope.workshopNames, $scope.workshop.name);
				});
			};
			$scope.getWorkshops();

			function setDateTimeModels(dateTime) {
				$scope.workshopTime = new Date(dateTime);
				$scope.workshop.workshopDate = new Date(dateTime);
			}

			if (WorkshopSvc.current && WorkshopSvc.creating) {
				$scope.workshop = WorkshopSvc.current;
				setDateTimeModels($scope.workshop.workshopDate);
			} else if ($stateParams.id) {
				WorkshopSvc.read($stateParams.id, null, true).then(function(w) {
					WorkshopSvc.startEditing();
					$scope.workshop = w;
					setDateTimeModels(w.workshopDate);
				});
			}



			$scope.backToWorkshops = function() {
				WorkshopSvc.reset();
				$state.go('admin.workshops.home');
			};

			$scope.saveWorkshop = function() {
				// Add time to date object
				$scope.workshop.workshopDate.setHours($scope.workshopTime.getHours());
				$scope.workshop.workshopDate.setMinutes($scope.workshopTime.getMinutes());

				function beforeSave(w) {
					w.name = $scope.workshop.name;
					w.attendanceList = $scope.workshop.attendanceList;
				}

				WorkshopSvc.save(beforeSave).then(function(w) {
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
			};

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