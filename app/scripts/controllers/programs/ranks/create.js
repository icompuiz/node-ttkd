define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('CreateRankCtrl', ['$document', '$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($document, $scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.subrankObjs = [];
			var tmpRanks = [];
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};

			function setDropdownItems() {
				var ordered = [];
				if (program.rankObjs.length > 0){ 
					ordered = _.sortBy(program.rankObjs, 'rankOrder');
				}

				var orders = _.map(ordered, function(r){return r.rankOrder;});

				if (!$scope.rank.rankOrder) {
					$scope.rank.rankOrder = ordered.length + 1;
					orders.push($scope.rank.rankOrder);
				}
				
				$scope.dropdown.items = orders;	
			}

			if (RankSvc.current && RankSvc.creating) {
				$scope.rank = RankSvc.current;
				if ($scope.rank.intermediaryRanks) {
					var subrankObjs = [];
					async.each($scope.rank.intermediaryRanks,
						function(subrankId, callback) {
							RankSvc.read(subrankId, null, false).then(function(subrank) {
								subrankObjs.push(subrank);
								callback();
							});
						},
						function(err) {
							$scope.rank.subrankObjs = subrankObjs;
						});
				}
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
								if (r) {
									rankObjs.push(r);
								}
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
				if ($stateParams.id) {
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
				var subrankIds = [];
				if (!program.rankObjs) {
					program.rankObjs = [];
				}

				//Perform the rank order swap if necessary
				if ($scope.showOrderWarning) {
					$scope.swapRank.rankOrder = $scope.swapRank.newRankOrder;
				}
				$scope.rank.subrankObjs = tmpRanks;
				program.rankObjs.push($scope.rank);
				ProgramSvc.init(program);

				RankSvc.reset();

				goToPrevState();
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

			$scope.getNumSelected = function() {
				var selected = _.where(tmpRanks, {isSelected: true});
				return selected.length;
			};

            $scope.setPagingData = function(data){
                $scope.myData = data;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.clearColor = function() {
            	$scope.rank.color = undefined;
            };

            $scope.getData = function () {
                var data = [];
                _($scope.rank.intermediaryRanks).forEach(function(r) {
                	data.push(r);
                });
                $scope.setPagingData(data);                
            };

           	//$scope.getData();

            $scope.$watch('rank.color', function (newVal, oldVal) {
            	if (!$scope.rank.color) {
            		$('.rank-color').css('background', '#FFFFFF');
            		$('.rank-color').text('None');
            	} else {
                	$('.rank-color').css('background', newVal);
            		$('.rank-color').text('');
            	}
            }, true);

            $scope.addSubrank = function() {
            	var newRankOrder = tmpRanks.length + 1;

            	var newRank = {
            		name: '<NAME>',
            		rankOrder: newRankOrder, 
            		divId: 'r' + makeid(),
            		isIntermediaryRank: true
            	};

            	tmpRanks.push(newRank);
            	$scope.subrankObjs = tmpRanks;
            	//$scope.getData();
            };

             $scope.removeDisabled = function() {
            	var selected = _.where(tmpRanks, {isSelected: true});
                return selected.length === 0;
            };

            $scope.remove = function() {
                $scope.showRemoveConfirm = true;
            };

            $scope.confirmRemove = function(remove) {
                if(remove) {   

            		var ordered = $('#sortable li').map(function(i) { return this.id; }).get();

                    _(tmpRanks).forEach(function(r) {
                    	if(r.isSelected) {
                    		$('#'+r.divId).remove();  
                    		tmpRanks = _.without(tmpRanks, r);
                    		ordered = _.without(ordered, r.divId);
                    	}
                    });

                    _(tmpRanks).forEach(function(r){
            			r.rankOrder = _.indexOf(ordered, r.divId) + 1;
            		});
            		$scope.rank.subrankObjs = tmpRanks;

                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
                if(!$scope.$$phase) {
               		$scope.$apply();
               	}
            };

            $scope.intermediaryRanks = tmpRanks;

            $('#sortable').sortable({
            	stop: function(event, ui) {
            		var ordered = $('#sortable li').map(function(i) { return this.id; }).get();

            		_(tmpRanks).forEach(function(r){
            			r.rankOrder = _.indexOf(ordered, r.divId) + 1;
            		});
	                if(!$scope.$$phase) {
	               		$scope.$apply();
	               	}
            	}
            });

           $scope.stopEditingName = function(e) {
            	if (e.keyCode === 13) {
	            	_(tmpRanks).forEach(function(r) {
	        			r.editingName = false;
	        			$scope.$apply();
	        		});
	        	}
            }

            function makeid(){
			    var text = "";
			    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			    for( var i=0; i < 5; i++ )
			        text += possible.charAt(Math.floor(Math.random() * possible.length));

			    return 'r' + text;
			}

            $document.bind('click', function(e) {
            	e.stopPropagation();
            	if (e.target.className.indexOf('edit-name') < 0) {
          	  		_(tmpRanks).forEach(function(r) {
            			r.editingName = false;
		                if(!$scope.$$phase) {
		               		$scope.$apply();
		               	}
            		});
            	}
            });

            $scope.edit = function(r) {
            	r.editingName = true;
            };

            $scope.select = function(r, e) {
            	if (e.target.className.indexOf('edit-name') > -1 || r.editingName) {
            		return;
            	}
            	r.isSelected = !r.isSelected;
            	if (r.isSelected) {
        			$('#' + r.divId + ' .rank-list-item').css('background-color', '#c9dde1');
            	} else {
        			$('#' + r.divId + ' .rank-list-item').css('background-color', '#d4d4d4');
            	}
            };

            $scope.showRemoveConfirm = false;

/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canCreateRank = function() {

				// Validate name
				if ($scope.isEmpty($scope.rank.name) || $scope.isDupName()) {
					return false;
				}

				// Validate sub-ranks
				if ($scope.showSubrankNameMessage()) {
					return false;
				}

				return true;
			};

			$scope.isDupName = function() {
				if (!program.rankObjs) {
					return false;
				}

				var names = [];
				if (program) {
					names = _.map(program.rankObjs, function(c){return c.name;});
				}

				return _.contains(names, $scope.rank.name);
			};

			$scope.showSubrankNameMessage = function() {
				var names = [],
					uniq = [];
				if (tmpRanks) {
					names = _.map(tmpRanks, function(r){return r.name;});
					uniq = _.uniq(names);
					return (names.length !== uniq.length);
				}
				return false;
			};
	}]);
});	