define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('UnrankedCheckinCtrl', ['$scope', '$http', '$log', '$state', '$stateParams',
		function($scope, $http, $log, $state, $stateParams) {

			// get class
			$scope.selectedClassId = $stateParams.id;
			$scope.selectedRankId = $stateParams.id;
			$scope.selectedType = 'students';

			$scope.testMe = 'ads';

		}
	]);

});
