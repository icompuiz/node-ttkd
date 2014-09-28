define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('CreateRankCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};

			// load current program and rank if available from services
			if (RankSvc.current && RankSvc.creating) {
				$scope.rank = RankSvc.current;
				program = ProgramSvc.current;
			// Otherwise get them from db
			} else if ($stateParams.id) { 
				ProgramSvc.read($stateParams.id, null, true).then(function(p) {
					var rankObjs = [];
					async.each(p.ranks,  // Attach rank objects to current program
						function(rId, callback) {
							RankSvc.read(rId, null, false).then(function(r) {
								rankObjs.push(r);
								callback();
							});
						},
						function(err) {
							program = p;
							program.rankObjs = rankObjs;
						}
					);
					$scope.rank = {
						program: ProgramSvc.current._id
					};
					RankSvc.init($scope.rank);
				});					
			} else {
				program = ProgramSvc.current;
				if (!program.rankObjs) {
					program.rankObjs = [];
				}
			}

			// For new ranks, initialize to the last rankOrder for the program
			if (!$scope.rank.rankOrder) {
				$scope.rank.rankOrder = program.rankObjs.length + 1;
			}

			function setDropdownItems() {
				var ordered = _.sortBy(program.rankObjs, 'rankOrder');
				var orders = _.map(ordered, function(r){return r.rankOrder;});
				orders.push($scope.rank.rankOrder);

				$scope.dropdown.items = orders;
			}

			$scope.$watch(program.rankObjs, setDropdownItems);

			$scope.setRankOrder = function(newVal) {
				if (!$scope.oldVal) {
					$scope.oldVal = $scope.rank.rankOrder;
				}

				var found = _.find(program.rankObjs, function(o){return o.rankOrder === newVal;});
				if (found) {
					$scope.swapRank = found;
					$scope.swapRankOrder = $scope.oldVal;
					$scope.showOrderWarning = true;
				} else {
					$scope.showOrderWarning = false;
				}

				$scope.rank.rankOrder = newVal;

				// HACK to close bootstrap dropdown after Item is selected
				// otherwise the dropdown menu stays open after item selection any time
				// after the initial selection
				$('[data-toggle="dropdown"]').parent().removeClass('open');
			};

			function goToPrevState() {
				if (ProgramSvc.editing) {
					$state.go('admin.programs.edit', {id: $scope.rank.program});
				} else if (ProgramSvc.creating) {
					$state.go('admin.programs.create');
				} else {
					$state.go('admin.programs.home');
				}
			}


			$scope.cancelCreate = function() {

				RankSvc.reset();

				goToPrevState();
			};

			$scope.createRank = function() {

				//Perform the rank order swap if necessary
				if ($scope.showOrderWarning) {
					$scope.swapRank.rankOrder = $scope.swapRankOrder;
				}

				program.rankObjs.push($scope.rank);

				RankSvc.reset();

				goToPrevState();
			};



/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canCreateRank = function() {
				return !$scope.isEmpty($scope.rank.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				var names = [];
				if (program) {
					names = _.map(program.rankObjs, function(c){return c.name;});
				}

				return _.contains(names, $scope.rank.name);
			};
	}]);
});	