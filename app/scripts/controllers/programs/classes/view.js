define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('ViewClassCtrl', ['$scope', '$state', 'Restangular', 'ClassSvc',
		function($scope, $state, Restangular, ClassSvc) {
			$scope.currentClass = {};

			if (ClassSvc.current && ClassSvc.viewing) {
				$scope.currentClass = ClassSvc.current;
			} else {
				$scope.currentClass = ClassSvc.init({
					program: ProgramSvc.current._id
				});
			}

			$scope.goBack = function() {

				ClassSvc.reset();

				$state.go('admin.programs.view', { programId: program._id });
			};

	}]);
});	