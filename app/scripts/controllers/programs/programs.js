define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ProgramsCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.allChecked = false;

			$scope.getPrograms = function() {
				ProgramSvc.list().then(function(programs) {
					//Get class objects and put into programs
					ClassSvc.list().then(function(classes) {
						var i;
						for(i=0; i<programs.length; i++) {
							programs[i].classes = _.where(classes, {'program': programs[i]._id});
						}
					});
					//Get rank objects and put into programs
					RankSvc.list().then(function(ranks) {
						var i;
						for(i=0; i<programs.length; i++) {
							programs[i].ranks = _.where(ranks, {'program': programs[i]._id});
						}
					});
					$scope.programs = programs;
				});
			};
			$scope.getPrograms();

			$scope.removeProgram = function(program) { 

				function removeClassesFromProgram(callback, err) {
					//Remove program's classes
					async.each(program.classes,
						function(classToRemove, callback) {
							ClassSvc.read(classToRemove._id, null, true).then(function(c) {
								ClassSvc.remove().then(function() {
									ClassSvc.reset();
									callback();
								});
							});
						},
						function(err) {
							callback();
						}
					);
				}

				function removeRanksFromProgram(callback, err) {
					//Remove program's ranks
					async.each(program.ranks,
						function(rankToRemove, callback) {
							RankSvc.read(rankToRemove._id, null, true).then(function(r) {
								RankSvc.remove().then(function() {
									RankSvc.reset();
									callback();
								});
							});
						},
						function(err) {
							callback();
						}
					);
				}

				function removeProgramData(program) {

					async.parallel([
						removeClassesFromProgram,
						removeRanksFromProgram, 
						function(err) {
							//Remove program
							ProgramSvc.read(program._id, null, true).then(function(p) {
								ProgramSvc.remove().then(function() {
									$scope.programs = _.without($scope.programs, program);
									ProgramSvc.reset();
								});
							});
					}]);
				}

				var r = confirm('Are you sure you want to delete this program? This will remove all associated classes and ranks.');
				if (r) {
					removeProgramData(program);
				}

			};


			$scope.removeSelected = function() {
				var i;
				for(i=0; i<$scope.programs.length; i++) {
					if($scope.programs[i].selected){
						$scope.removeProgram($scope.programs[i]);
					}
				}
			};

			$scope.checkAll = function() {
				var i;
				for(i=0; i<$scope.programs.length; i++){
					$scope.programs[i].selected = $scope.allChecked;
				}
			};

			$scope.goToCreateProgram = function() {
				ProgramSvc.reset();
				ProgramSvc.startCreating();
				$state.go('admin.programs.create');
			};

			$scope.goToEditProgram = function(program) {
				ProgramSvc.startEditing();
				ProgramSvc.init(program);
				$state.go('admin.programs.edit', { id: program._id });
			};

			$scope.goToViewProgram = function(program) {
				ProgramSvc.startViewing();
				ProgramSvc.init(program);
				$state.go('admin.programs.view', { id: program._id });
			};

	}]);
});	