define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ViewWorkshopCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'WorkshopSvc',
		function($rootScope, $scope, $state, $stateParams, WorkshopSvc) {
			$scope.workshop = {};

			// load current program and rank if available from services
			if (WorkshopSvc.current && WorkshopSvc.viewing) {
				$scope.workshop = WorkshopSvc.current;
			// Otherwise get them from db
			} else if ($stateParams.id) { 
				WorkshopSvc.read($stateParams.id, null, true).then(function(w) {
					$scope.workshop = WorkshopSvc.current;
				});					
			}

			function goToPrevState() {
                if ($rootScope.previousState && $rootScope.previousParams) {
                    $state.go($rootScope.previousState, $rootScope.previousParams);
                } else if ($rootScope.previousState) {
                    $state.go($rootScope.previousState);
                } else { // Default to the programs home page
                    $state.go('admin.workshops.home'); 
                }
			}


			$scope.back = function() {

				WorkshopSvc.reset();

				goToPrevState();
			};
	}]);
});	