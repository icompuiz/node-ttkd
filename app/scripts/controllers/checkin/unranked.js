define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('UnrankedCheckinCtrl', ['$scope', '$http', '$log', '$state', '$stateParams',
		function($scope, $http, $log, $state, $stateParams) {

			// get class
			$scope.selectedClassId = $stateParams.classId;
			$scope.selectedType = 'students';


		}
	]);

});
