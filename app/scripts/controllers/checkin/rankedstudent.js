define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('StudentsCheckinCtrl', ['$scope', '$http', '$log', '$state', '$stateParams',
		function($scope, $http, $log, $state, $stateParams) {

			// get class
			$scope.selectedClassId = $stateParams.classId;
			$scope.selectedRankId = $stateParams.rankId;
			$scope.selectedType = 'students';

		}
	]);

});
