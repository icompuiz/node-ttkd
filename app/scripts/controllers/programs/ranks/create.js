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

			function setDropdownItems() {
				var ordered = _.sortBy(program.rankObjs, 'rankOrder');
				var orders = _.map(ordered, function(r){return r.rankOrder;});

				if (!$scope.rank.rankOrder) {
					$scope.rank.rankOrder = ordered.length + 1;
					orders.push($scope.rank.rankOrder);
				}
				
				$scope.dropdown.items = orders;
			}

			if (ProgramSvc.current) {
				program = ProgramSvc.current;
				$scope.rank.program = program._id;
				setDropdownItems();
			} else if ($stateParams.id) { 
				ProgramSvc.editing = true;
				ProgramSvc.read($stateParams.id, null, true).then(function(p) {
					var rankObjs = [];

					$scope.rank = {
						program: ProgramSvc.current._id
					};
					RankSvc.init($scope.rank);

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
							setDropdownItems();
						}
					);
				});					
			} 

			$scope.setRankOrder = function(newVal) {
				if (!$scope.origRankOrder) {
					$scope.origRankOrder = $scope.rank.rankOrder;
				}

				var found = _.find(program.rankObjs, function(o){return o.rankOrder === newVal;});
				if (found) {
					$scope.swapRank = found;
					$scope.swapRank.newRankOrder = $scope.origRankOrder;
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
				if (!program.rankObjs) {
					program.rankObjs = [];
				}

				//Perform the rank order swap if necessary
				if ($scope.showOrderWarning) {
					$scope.swapRank.rankOrder = $scope.swapRank.newRankOrder;
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