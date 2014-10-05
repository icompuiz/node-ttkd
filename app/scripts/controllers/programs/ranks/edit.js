define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('EditRankCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($rootScope, $scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};

			var orig = null;

			function setDropdownItems() {
				var ordered = _.sortBy(program.rankObjs, 'rankOrder');
				var orders = _.map(ordered, function(r){return r.rankOrder;});

				$scope.dropdown.items = orders;
			}

			// load current program and rank if available from services
			if (RankSvc.current && RankSvc.editing) {
				$scope.rank = RankSvc.current;
				program = ProgramSvc.current;
				if (!RankSvc.orig) {
					RankSvc.orig = {
						name: RankSvc.current.name
					};
					orig = RankSvc.orig;
				}
				program.populated = true;
				setDropdownItems();
			// Otherwise get them from db
			} else if ($stateParams.id) { 
				RankSvc.read($stateParams.id, null, true).then(function(r) {
					$scope.rank = RankSvc.current;
					RankSvc.orig = {
						name: r.name
					};
					orig = RankSvc.orig;
					ProgramSvc.read(r.program, null, true).then(function(p) {
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
								program.populated = true;
								$scope.getData();
								setDropdownItems();
							}
						);
					});
				});					
			}

			// For new ranks, initialize to the last rankOrder for the program
			if (!$scope.rank.rankOrder && program.rankObjs) {
				$scope.rank.rankOrder = program.rankObjs.length + 1;
			}

			$scope.setRankOrder = function(newVal) {
				if (!$scope.origRankOrder) {
					$scope.origRankOrder = $scope.rank.rankOrder;
				}

				var found = _.find(program.rankObjs, function(o){return o.rankOrder === newVal;});
				if (found && found.name !== orig.name) {
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

			$scope.filterOptions = {
                filterText: '',
                useExternalFilter: true
            };

            $scope.totalServerItems = 0;

            $scope.pagingOptions = {
                pageSizes: [25, 50, 100, 250, 500, 1000],
                pageSize: 25,
                currentPage: 1
            };

            $scope.setPagingData = function(data){
                $scope.myData = data;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.getData = function () {
                var data = [];
                _($scope.rank.intermediaryRanks).forEach(function(r) {
                	data.push(r);
                });
                $scope.setPagingData(data);                
            };

           	$scope.getData();

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getData();
                }
            }, true);

            $scope.gridOptions = {
                data: 'myData',
                rowHeight: 40,
                enableCellSelection: true,
                enableRowSelection: false,
                enableCellEdit: true,
                beforeSelectionChange: function (rowItem, event) {
                    // check if one of the options buttons was clicked
                    if(event.target.tagName === 'BUTTON') {	
                        return false;
                    } else {
                        return true;
                    }
                },
                afterSelectionChange: function () {
                    if($scope.gridOptions.selectedItems.length === 0) {
                        $scope.showRemoveConfirm = false;
                    }
                    return true;
                },
                totalServerItems: 'totalServerItems',
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                sortInfo: { fields: ['lastName', 'firstname'], directions: ['asc', 'asc'] },
                columnDefs: [
                    { cellTemplate: '/partials/programs/ranks/subranks/rankCheckbox', width: 50, sortable: false, enableCellEdit: false },                	
                    { field: 'name', displayName: 'Rank Name' },
                    { field: 'rankOrder', displayName: 'Order' }
                ]
            };

            $scope.selectRank = function(row) {
            	_($scope.rank.intermediaryRanks).forEach(function(r){
            		if(r.rankOrder === row.entity.rankOrder) {
            			r.isSelected = !r.isSelected;

            			if(r.isSelected) {
            				$scope.gridOptions.selectedItems.length += 1;
            			} else {
            				$scope.gridOptions.selectedItems.length -= 1;
            			}
            		}
            	});
            };

            $scope.addSubrank = function() {
            	if(!$scope.rank.intermediaryRanks) {
            		$scope.rank.intermediaryRanks = [];
            	}

            	var newRankOrder = $scope.rank.intermediaryRanks.length + 1;

            	var newRank = {
            		name: '<Name>',
            		rankOrder: newRankOrder
            	};

            	$scope.rank.intermediaryRanks.push(newRank);
            	$scope.getData();
            };

            $scope.removeDisabled = function() {
                return $scope.gridOptions.selectedItems.length === 0;
            };

            $scope.remove = function() {
                $scope.showRemoveConfirm = true;
            };

            $scope.confirmRemove = function(remove) {
                if(remove) {

                    _($scope.rank.intermediaryRanks).forEach(function(rank) {
                    	if(rank.isSelected) {
                    		$scope.rank.intermediaryRanks = _.without($scope.rank.intermediaryRanks, rank);
                    	}
                    });

                    $scope.getData();

                    // empty selection
                    $scope.gridOptions.selectedItems.length = 0;

                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
            };

            $scope.showRemoveConfirm = false;

			function goToPrevState() {
				if (!$rootScope.previousState) {
					$state.go('admin.programs.edit', {id: $scope.rank.program});
				} else if ($rootScope.previousParams) {
					$state.go($rootScope.previousState, $rootScope.previousParams);
				} else {
					$state.go($rootScope.previousState);
				}
			}


			$scope.cancelEdit = function() {

				RankSvc.reset();
				RankSvc.orig = null;

				goToPrevState();
			};

			$scope.saveRank = function() {
				//Find the original rank in the program and replace it with the edited rank
				var i = _.findIndex(program.rankObjs, function(r) {
					return r.name === RankSvc.orig.name;
				});
				if (i >= 0) {
					program.rankObjs[i] = $scope.rank;
				} else {
					program.rankObjs.push($scope.rank);
				}

				//Perform the rank order swap if necessary
				if ($scope.showOrderWarning) {
					$scope.swapRank.rankOrder = $scope.swapRank.newRankOrder;
				}

				RankSvc.reset();
				RankSvc.orig = null;

				goToPrevState();
				
			};

/********************** Validation **********************************/
			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canSaveRank = function() {

				// Validate name
				if ($scope.isEmpty($scope.rank.name) || $scope.isDupName()) {
					return false;
				}

				// Validate sub-ranks
				if ($scope.showSubrankNameMessage() || $scope.showSubrankOrderMessage()) {
					return false;
				}

				return true;
			};

			$scope.isDupName = function() {
				var names = [];
				if (program && program.populated && orig) {
					names = _.map(program.rankObjs, function(r){return r.name;});
					names = _.without(names, orig.name);
				}

				return _.contains(names, $scope.rank.name);
			};

			$scope.showSubrankNameMessage = function() {
				var names = [],
					uniq = [];
				if ($scope.rank.intermediaryRanks) {
					names = _.map($scope.rank.intermediaryRanks, function(r){return r.name;});
					uniq = _.uniq(names);
					return (names.length !== uniq.length);
				}
				return false;
			};

			$scope.showSubrankOrderMessage = function() {
				var orders = [],
					uniq = [];
				if ($scope.rank.intermediaryRanks && $scope.rank.intermediaryRanks.length > 0) {
					orders = _.map($scope.rank.intermediaryRanks, function(r){return r.rankOrder;});

					// Check for duplicates
					uniq = _.uniq(orders);
					if (uniq.length !== orders.length) {
						return true;
					}

					// Make sure ordering starts at 1
					if (!_.contains(orders, 1)) {
						return true;
					}

					// Make sure they increment by 1
					if (_.max(orders) != $scope.rank.intermediaryRanks.length) {
						return true;
					}
				}
				return false;
			};
	}]);
});	