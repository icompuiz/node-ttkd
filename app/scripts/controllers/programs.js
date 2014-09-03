define(['./module'], function(controllers){
	'use strict';
	controllers.controller('programsCtrl', ['$scope', '$state', 'Restangular', function($scope, $state, Restangular) {
		var basePrograms = Restangular.all('programs');

		$scope.programs = basePrograms.getList().$object;

		$scope.getPrograms = function() {
			$scope.programs = basePrograms.getList().$object;
		}

		$scope.addProgram = function(newName) {
			var newProgram = {
				name: newName
			};
			Restangular.post(newProgram);
		}
	}]);
});	