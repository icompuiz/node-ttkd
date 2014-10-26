	define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('EditRankCtrl', ['$document', '$rootScope', '$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($document, $rootScope, $scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};
			var tmpRanks = [];

			var orig = null;

			function setDropdownItems() {
				var ordered = _.sortBy(program.rankObjs, 'rankOrder');
				var orders = _.map(ordered, function(r){return r.rankOrder;});

				$scope.dropdown.items = orders;
			}

			function attachSubranks(callback) {
				var subrankObjs = [];
				async.each($scope.rank.intermediaryRanks,
					function(subrankId, callback) {
						RankSvc.read(subrankId, null, false).then(function(subrank) {
							// Attach sub-rank identifiers
							subrank.isIntermediaryRank = true;
							subrank.divId = 'r' + subrank._id;

							subrankObjs.push(subrank);
							callback();
						});
					},
					function(err) {
						$scope.rank.subrankObjs = subrankObjs;
						callback();
				});
			}

			// Make an identifier for the sub-rank list item divs
            function makeid(){
			    var text = "";
			    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			    for( var i=0; i < 5; i++ )
			        text += possible.charAt(Math.floor(Math.random() * possible.length));

			    return 'r' + text;
			}

			// load current program and rank if available from services
			if (RankSvc.current && RankSvc.editing) {
				$scope.rank = RankSvc.current;
				if ($scope.rank.subrankObjs) {
					_($scope.rank.subrankObjs).forEach(function(obj) {
						obj.divId = 'r' + makeid();
					});
					tmpRanks = _.sortBy($scope.rank.subrankObjs, function(r) {return r.rankOrder;});
					_(tmpRanks).forEach(function(r) {
						r.isSelected = false;
					});
					$scope.rank.subrankObjs = tmpRanks;
				}

				program = ProgramSvc.current;
				if (!RankSvc.orig) {
					RankSvc.orig = {
						name: RankSvc.current.name
					};
					orig = RankSvc.orig;
				}
				program.populated = true;
				setDropdownItems();
				setSortableWidth();
			// Otherwise get them from db
			} else if ($stateParams.id) { 
				RankSvc.read($stateParams.id, null, true).then(function(r) {
					$scope.rank = RankSvc.current;
					if ($scope.rank.intermediaryRanks) {
						attachSubranks(function() {
							tmpRanks = _.sortBy($scope.rank.subrankObjs, function(r) {return r.rankOrder;});
							_(tmpRanks).forEach(function(r) {
								r.isSelected = false;
							});
							$scope.rank.subrankObjs = tmpRanks;
						});
					}

					RankSvc.orig = {
						name: r.name
					};
					orig = RankSvc.orig;
					ProgramSvc.read(r.program, null, true).then(function(p) {
						var rankObjs = [];

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
								program.populated = true;
								setDropdownItems();
								setSortableWidth();
							}
						);
					});
				});			
			}			
			_(tmpRanks).forEach(function(r) {
				r.isSelected = false;
			});

			// Initialize to the last rankOrder for the program
			if (!$scope.rank.rankOrder && program.rankObjs) {
				$scope.rank.rankOrder = program.rankObjs.length + 1;
			}

			$scope.getNumSelected = function() {
				var selected = _.where(tmpRanks, {isSelected: true});
				return selected.length;
			};

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

            $scope.clearColor = function() {
            	$scope.rank.color = '';
            };

            $scope.$watch('rank.color', function (newVal, oldVal) {
            	if ($scope.rank.color === '') {
            		$('.rank-color').css('background', '#FFFFFF');
            		$('.rank-color').text('None');
            	} else {
                	$('.rank-color').css('background', newVal);
            		$('.rank-color').text('');
            	}
            }, true);

            function setSortableWidth() {
            	var maxlen = 0;
            	_($scope.subrankObjs).forEach(function(subrank) {
            		maxlen = subrank.name.length > maxlen ? subrank.name.length : maxlen;
            	});
            	
            	maxlen = maxlen*10 + 80; 

            	$('.sortable').css('width', maxlen);
            }

            $scope.addSubrank = function() {
            	var newRankOrder = tmpRanks.length + 1;

            	var newRank = {
            		name: '<NAME>',
            		rankOrder: newRankOrder,
            		divId: 'r' + makeid(),
            		isIntermediaryRank: true
            	};

            	tmpRanks.push(newRank);
            	setSortableWidth();
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
            		$scope.subrankObjs = tmpRanks;


                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
                if(!$scope.$$phase) {
               		$scope.$apply();
               	}               	
            	setSortableWidth();
            };

            $('#sortable').sortable({
            	stop: function(event, ui) {
            		var ordered = $('#sortable li').map(function(i){return this.id;}).get();

            		_(tmpRanks).forEach(function(r) {
            			r.rankOrder = _.indexOf(ordered, r.divId) + 1;
            		}); 
	                if(!$scope.$$phase) {
	               		$scope.$apply();
	               	}
            	}
            });

            $document.bind('click', function(e) {
            	e.stopPropagation();
            	if (e.target.className.indexOf('edit-name') < 0) {
          	  		_(tmpRanks).forEach(function(r) {
            			r.editingName = false;
            			$scope.$apply();
            		});
            	}

            	// Do not allow sorting if there are duplicate
            	var ordered = $('#sortable li').map(function(i) { return this.divId; }).get();
            	var uniq = _.uniq(ordered);

            	if (uniq.length !== ordered.length) {
            		$('#sortable').sortable('disable');
            	} else {
            		$('#sortable').sortable('enable');
            	}
            });

            $scope.edit = function(r) {
            	r.editingName = true;
            };

            function makeid(){
			    var text = "";
			    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			    for( var i=0; i < 5; i++ )
			        text += possible.charAt(Math.floor(Math.random() * possible.length));

			    return 'r' + text;
			}

            $scope.select = function(r, $event) {
            	r.isSelected = !r.isSelected;
            	if (r.isSelected) {
        			$('#' + r.divId + ' .rank-list-item').css('background-color', '#c9dde1');
            	} else {
        			$('#' + r.divId + ' .rank-list-item').css('background-color', '#d4d4d4');
            	}
            };

            $scope.showRemoveConfirm = false;

			function goToPrevState() {
				$state.go('admin.programs.edit', {id: ProgramSvc.current._id});
				
			}


			$scope.cancelEdit = function() {

				RankSvc.reset();
				RankSvc.orig = null;

				$state.go('admin.programs.edit', {id: program._id});
			};

			$scope.saveRank = function() {
				$scope.rank.subrankObjs = $scope.subrankObjs;
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

				$state.go('admin.programs.edit', {id: program._id});
				
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
				if ($scope.showSubrankNameMessage()) {
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
				if (tmpRanks) {
					names = _.map(tmpRanks, function(r){return r.name;});
					uniq = _.uniq(names);
					return (names.length !== uniq.length);
				}
				return false;
			};
	}]);
});	