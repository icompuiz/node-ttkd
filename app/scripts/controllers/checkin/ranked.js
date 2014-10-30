define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('RankedCheckinCtrl', ['$scope', '$http', '$log', '$state', '$stateParams', 'ProgramSvc', 'ClassSvc',
		function($scope, $http, $log, $state, $stateParams, ProgramSvc, ClassSvc) {

			// get class
			$scope.selectedClassId = $stateParams.classId;
			$scope.selectedType = 'students';

			ClassSvc.read($scope.selectedClassId, null, false).then(function(classDoc) {
				var program = classDoc.program;
				ProgramSvc.read(program, {populate: 'ranks'}, false).then(function(programDoc) {
					$scope.ranks = _.sortBy(programDoc.ranks, function(orderBy) {
						return orderBy.rankOrder;
					});
				});
			});

			$scope.rankSelected = function(rank) {
				$state.go('checkin.home.studentsRanked', {classId: $scope.selectedClassId, rankId: rank._id});
			};

		}
	]);

});