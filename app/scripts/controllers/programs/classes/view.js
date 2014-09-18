define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('ViewClassCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'ClassSvc',
		function($scope, $state, $stateParams, Restangular, ClassSvc) {
			$scope.currentClass = {};

			if (ClassSvc.current && ClassSvc.viewing) {
				$scope.currentClass = ClassSvc.current;
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(c) {
					$scope.currentClass = c;
				})
			} else {
				$scope.currentClass = ClassSvc.init({
					program: ProgramSvc.current._id
				});
			}

			$scope.goBack = function() {

				ClassSvc.reset();

				$state.go('admin.programs.view', {id: $scope.currentClass.program} );
			};

	}]);
});	