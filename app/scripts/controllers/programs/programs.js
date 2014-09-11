define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ProgramsCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.allChecked = false;
			$scope.currentProgram = {};

			if (ProgramSvc.current) {
				$scope.currentProgram = ProgramSvc.current;
			} 

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
				async.parallel([
					function(callback, err) {
						//Remove program's classes
						async.each(program.classes,
							function(classToRemove, callback) {
								ClassSvc.init(classToRemove);
								ClassSvc.remove().then(function() {
									callback();
									ClassSvc.reset();
								});
							},
							function(err) {
								callback();
							}
						);
					},
					function(callback, err) {
						//Remove program's ranks
						async.each(program.ranks,
							function(rankToRemove, callback) {
								RankSvc.init(rankToRemove);
								RankSvc.remove().then(function() {
									callback();
									RankSvc.reset();
								});
							},
							function(err) {
								callback();
							}
						);
					}, 
					function(err) {
						//Remove program
						ProgramSvc.init(program);
						ProgramSvc.remove().then(function() {
							$scope.programs = _.without($scope.programs, program);
							ProgramSvc.reset();
					});
				}]);
			};

			$scope.goToCreateProgram = function() {
				$state.go('admin.programs.create');
			};

			$scope.goToProgramsHome = function() {
				ProgramSvc.reset();
				$state.go('admin.programs.home');
			};

			$scope.checkAll = function() {
				var i;
				for(i=0; i<$scope.programs.length; i++){
					$scope.programs[i].selected = $scope.allChecked;
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

			$scope.goToEditProgram = function(program) {
				ProgramSvc.init(program);
				$state.go('admin.programs.edit');
			};

			$scope.goToViewProgram = function(program) {
				ProgramSvc.init(program);
				$state.go('admin.programs.view');
			};

			$scope.saveProgram = function(program) {
				var classIDs = [],
					rankIDs = [];

				(function(classIDs, rankIDs) {
					async.each(program.classes,
						function(classItem, callback) {
							ClassSvc.init(classItem);
							ClassSvc.save().then(function(result) {
								classIDs.push(result._id);
								callback();
							});
						},
						function(err) {
							program.classes = classIDs;
							program.ranks = [];
							ProgramSvc.save().then(function(result) {
								console.log('post-save');
							});
							$state.go('admin.programs.home');
						});
				})(classIDs, rankIDs);
			};
	}]);
});	