define(['./module'], function(directives){
	'use strict';

	return directives.directive('ttkdSwiper', ['$log', function ($log) {
		var ttkdSwiper = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper',
			scope: {
				type: '=',
				selectedClassId: '=',
				selectedRankId: '='
			},

			controller: function($scope, $state, AchievementSvc, WorkshopSvc, ProgramSvc, ClassSvc, StudentSvc, RankSvc) {
				// Load data based on type

				// store students so we don't need to reload
				$scope.allStudents = [];

				if($scope.type === 'students' && $scope.selectedClassId) {
					$log.log('Attempting to load students...');


					// if it is a workshop load all student
					WorkshopSvc.read($scope.selectedClassId, null, false).then(function(workshopDoc){
						if(workshopDoc) {
							loadBreadcrumbs($scope.selectedClassId, null, true);
							loadStudentsForWorkshop();
						} else {
						// Add breadcrumb navigation
						loadBreadcrumbs($scope.selectedClassId, $scope.selectedRankId);

						loadStudents($scope.selectedClassId, $scope.selectedRankId);
						}
					});

				} else {
					$log.log('Attempting to load programs...');
					loadProgramsAndClasses();
				}

				function loadBreadcrumbs(selectedClassId, selectedRankId, isWorkshop) {
					$scope.breadcrumbs = [];

					if(selectedClassId) {
						if(!isWorkshop) {
							ClassSvc.read(selectedClassId, {populate: 'program'}, false).then(function(classDoc){
								$scope.breadcrumbs.program = {
									content: classDoc.program.name
								};

								$scope.breadcrumbs.class = {
									content: classDoc.name
								};
							});
						}else{
							WorkshopSvc.read(selectedClassId, null, false).then(function(workshopDoc){
								$scope.breadcrumbs.program = {
									content: 'Workshop'
								};

								$scope.breadcrumbs.class = {
									content: workshopDoc.name
								};
							});
						}
					}

					if(selectedRankId) {
						RankSvc.read(selectedRankId, null, false).then(function(rankDoc) {
							if(rankDoc.color) {
								$scope.breadcrumbs.rank = {
									style: 'background-color: ' + rankDoc.color + ';',
									content: rankDoc.name
								};
							} else {
								$scope.breadcrumbs.rank = {
									content: rankDoc.name
								};
							}
						});
					} else {
						$scope.breadcrumbs.rank = {
							content: 'Click to Select Rank'
						};
					}
				}

				function loadStudents(selectedClassId, selectedRankId) {
					// Do something with the rank if provided
					ClassSvc.read(selectedClassId, {populate: 'students'}, false).then(function(classDoc){
						// Select achievements
						if(selectedRankId) {
							var validStudents = [];
							var numberToCheck = classDoc.students.length;
							var numberChecked = 0;

							_.each(classDoc.students, function(studentDoc){
								var params = {
									class: selectedClassId,
									student: studentDoc._id,
									sort: '-dateAchieved',
									limit: 1,
									populate: 'student'
								};

								AchievementSvc.list(params).then(function(achievements) {
									numberChecked += 1;

									if(!_.isEmpty(achievements) && achievements[0].rank === selectedRankId) {
										//add it
										validStudents.push(studentDoc);
									}

									if(numberChecked === numberToCheck) {
										$scope.data = {
											students: validStudents,
											type: 'students'
										};
									}
								});
							});


						} else {
							$scope.data = {
								students: classDoc.students,
								type: 'students'
							};
						}
					});
				}

				function loadStudentsForWorkshop() {
					StudentSvc.list().then(function(students){
						$scope.data = {
							students: students,
							type: 'students',
							isWorkshop: true
						};
					});
				}

				function loadProgramsAndClasses() {
					var data = [];

					ProgramSvc.list({populate: ['classes', 'ranks']}).then(function(programs) {
						_.each(programs, function(program) {
							data.push({
								'classObjs': program.classes,
								'name': program.name,
								'classNames': _.map(program.classes, function(c){return c.name;}),
								'ranks': program.ranks,

								'_id': program._id
							});
						});

						$scope.data = {
							classes: _.clone(data),
							type: 'class'
						};

						// And load workshops

						WorkshopSvc.list().then(function(workshops) {
							var data = [];
							var classObjs = [];
							var classNames = [];

							_.each(workshops, function(workshop) {
								classObjs.push(workshop);
								classNames.push(workshop.name);
							});

							data.push({
								'name': 'Workshops',
								'classObjs': classObjs,
								'classNames': classNames
							});

							$scope.workshopData = {
								workshops: _.clone(data),
								type: 'workshop'
							};
						});
					});
				}

				$scope.goToSelectRank = function(classId) {
					$state.go('checkin.home.ranked', {classId: classId});
				};

				$scope.goToSelectProgram = function() {
					$state.go('checkin.home.programs');
				};

				$scope.nameFilters = [];
				$scope.nameFilters.push({
					filterLabel: 'A-E',
					filterArray: ['A','B','C','D','E'],
					isActive: false
				});
				$scope.nameFilters.push({
					filterLabel: 'F-J',
					filterArray: ['F','G','H','I','J'],
					isActive: false
				});
				$scope.nameFilters.push({
					filterLabel: 'K-O',
					filterArray: ['K','L','M','N','O'],
					isActive: false
				});
				$scope.nameFilters.push({
					filterLabel: 'P-T',
					filterArray: ['P','Q','R','S','T'],
					isActive: false
				});
				$scope.nameFilters.push({
					filterLabel: 'U-Z',
					filterArray: ['U','V','W','X','Y','Z'],
					isActive: false
				});

				$scope.changeFilter = function(toFilter) {
					if(!toFilter) {
						$scope.currentFilter = null;
						$scope.filterValueArray = null;
					}

					// when a filter button is clicked a second time... remove filter
					if($scope.currentFilter === toFilter) {
						$scope.currentFilter.isActive = false;
						$scope.currentFilter = null;
						$scope.filterValueArray = null;
						return;
					}

					toFilter.isActive = true;
					$scope.filterValueArray = toFilter.filterArray;

					if($scope.currentFilter) {
						$scope.currentFilter.isActive = false;
					}

					$scope.currentFilter = toFilter;
				};


				$scope.filterStudents = function(filter, filterParam) {
					var maxLateralSlideDeck = 9;
					var allStudents = _.clone($scope.data.students);
					var filtered = allStudents;

					if(filter) {
						filtered = _.filter(filtered, function (student) {
							return _.contains(filter, student[filterParam][0]);
						});
					}

					if(filterParam) {
						// and sort...
						filtered = _.sortBy(filtered, function(student) {
							return student[filterParam];
						});
					}

					$scope.studentsFiltered = [];
					var returnableFiltered = $scope.studentsFiltered;
					var filteredLength = filtered.length;
					var neededLaterals = Math.ceil(filteredLength / maxLateralSlideDeck);

					for(var i=0; i<neededLaterals; i++) {
						var howMany;
						if(i+1 === neededLaterals) {
							howMany = filteredLength - (i * maxLateralSlideDeck);
						} else {
							howMany = maxLateralSlideDeck;
						}

						returnableFiltered.push({
							students: filtered.splice(0, howMany)
						});
					}

					$scope.studentsFiltered = returnableFiltered;
				};
			},

			link: function($scope) {
				$scope.$watch('data', function() {
					if(!$scope.data){
						return;
					}

					var swiperParent;

					if($scope.type === 'students') {
						swiperParent = new Swiper('.swiper-parent', {
							mode: 'horizontal',
							grabCursor: true,
							resistance: '100%'
						});
					} else {
						if($scope.data.length === 0) {
							return;
						}

						swiperParent = new Swiper('.swiper-parent', {
							mode: 'vertical',
							slidesPerView: 3,
							centeredSlides: true,
							watchActiveIndex: true,
							grabCursor: true,
							resistance: '100%'
						});
					}

					$scope.swiperParent = swiperParent;
				}, true);
			}
		};

		return ttkdSwiper;
	}])




	.directive('ttkdSwiperLateralItemClass', ['$log', '$compile', function($log, $compile) {
		var compileHack = $compile;

		var ttkdSwiperLateralItemClass = {
			restrict: 'A',
			scope: {
				parent: '=',
				item: '=',
				swiperId: '=',
				type: '='
			},

			link: function($scope) {
				var item = $scope.item;
				var swiperParent = $scope.parent;
				var slideClassName = 'swiper-nested-' + $scope.swiperId;

				//create a parent swiper for horizontal movement
				var rowTitle = '<div class="title">' + item.name + '</div>';
				var lateralSwiperWrapper = swiperParent.createSlide(rowTitle + '<div class="swiper-container nested '+slideClassName+'"><div class="swiper-wrapper nested"></div></div>', 'swiper-slide');
				//var lateralSwiperWrapper = swiperParent.createSlide('<div style="color:black">TY</div>', 'swiper-slide');

				lateralSwiperWrapper.append();

				swiperParent.hit = 'hit';

				var newLateralSwiperWrapper = new Swiper('.' + slideClassName, {
					mode: 'horizontal',
					slidesPerView: 4,
					centeredSlides: true,
					watchActiveIndex: true,
					resistance: '100%'
				});

				var lateralHeight;
				if(swiperParent.slides.length > 0){
					lateralHeight = swiperParent.slides[0].style.height;
				}

				$scope.classes = {};

				for(var j=0; j<item.classObjs.length; j++) {
					var classId = item.classObjs[j]._id;
					$scope.classes[classId] = item.classObjs[j];
					var hasRanks = !_.isEmpty(item.ranks);
					var newHSlide = newLateralSwiperWrapper.createSlide('<div ttkd-swiper-slide-item-class classes="classes" has-ranks="'+hasRanks+'" id="\''+classId+'\'"></div>', 'swiper-slide');
					newHSlide.append();
					compileHack(newHSlide)($scope);
					resizeLateralSlides(newLateralSwiperWrapper, lateralHeight);
				}

				//calculateHeight not working... quick/hacky fix
				function resizeLateralSlides(swiper, newHeight) {
					for(var i=0; i<swiper.slides.length; i++) {
						swiper.slides[i].style.height = newHeight;
					}
				}
			}
		};

		return ttkdSwiperLateralItemClass;
	}])

	.directive('ttkdSwiperLateralItemStudent', ['$log', '$compile', function($log, $compile) {
		var compileHack = $compile;

		var ttkdSwiperLateralItemStudent = {
			restrict: 'E',
			replace:true,
			scope: {
				parent: '=',
				items: '=',
				swiperId: '=',
				type: '=',
				filteredStudents: '=',
				classAttended: '=selectedClassId',
				isWorkshop: '='
			},

			link: function($scope) {
				$scope.$watch('filteredStudents', function() {
					var swiperParent = $scope.parent;
					$scope.swiperParent = swiperParent;

					if(!$scope.filteredStudents) {
						return;
					}

					// Remove all existing slides from parent to re-add
					swiperParent.removeAllSlides();

					// Now we can re-add slides with updated data
					var studentsCopy = _.clone($scope.filteredStudents);

					// Used to get the student when the individual student directive is called... mapped with his id
					$scope.students = [];

					// each studentSubset will contain 9 students
					_(studentsCopy).forEach(function(studentSubset) {
						// Generate inner template for 9 subset display
						var nineStudentsHtml = '';
						_(studentSubset.students).forEach(function(student) {
							var studentId = student._id;
							$scope.students[studentId] = student;

							var studentHtml = '';
							studentHtml += '<div class="col-xs-4" style="height: 33%; padding: 15px;">' + '\n';
							studentHtml += '  <div class="height-full panel" is-workshop="isWorkshop" ttkd-swiper-slide-item-student students="students" class-attended="classAttended" id="\''+studentId+'\'" style="padding:10px;">' + '\n';
							studentHtml += '  </div>' + '\n';
							studentHtml += '</div>' + '\n';

							nineStudentsHtml += studentHtml;
						});

						var nineStudents = swiperParent.createSlide(nineStudentsHtml, 'swiper-slide');
						nineStudents.append();

						compileHack(nineStudents)($scope);
					});

					swiperParent.swipeTo(0);
				}, true);
			}
		};

		return ttkdSwiperLateralItemStudent;
	}])

	.directive('ttkdSwiperSlideItemClass', ['$log', '$state', function($log, $state) {
		var ttkdSwiperSlideItemClass = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper-card-class',
			scope: {
				classId: '=id',
				classes: '=',
				hasRanks: '='
			},
			replace:true,

			controller: function($scope) {
				$scope.className = $scope.classes[$scope.classId].name;
				$scope.classContinue = function() {
					//if($scope.hasRanks) {
					//	$state.go('checkin.home.ranked', {classId: $scope.classId});
					//} else {
					$state.go('checkin.home.studentsUnranked', {classId: $scope.classId});
					//}
				};
			}
		};

		return ttkdSwiperSlideItemClass;
	}])

	.directive('ttkdSwiperSlideItemStudent', ['$log', 'StudentSvc', 'AttendanceSvc', 'ClassSvc', '$state', function($log, StudentSvc, AttendanceSvc, ClassSvc, $state) {
		var ttkdSwiperSlideItemStudent = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper-card-student',
			scope: {
				students: '=',
				studentId: '=id',
				classAttended: '=',
				isWorkshop: '='
			},
			replace:true,

			controller: function($scope) {
				var student = $scope.students[$scope.studentId];
				$scope.studentName = student.firstName + ' ' + student.lastName;
				$scope.studentAvatar = student.avatar;

				$scope.studentContinue = function() {
					var model = AttendanceSvc.init({});
					model.student = student._id;
					model.classAttended = $scope.classAttended;
					model.checkInTime = new Date();

					if($scope.isWorkshop) {
						model.workshop = true;
					}else{
						model.workshop = false;
					}

					function dismissMessage() {
						$("#alert_template").fadeOut('slow', function() {
						   	$("#alert_template span").remove();

						   	$state.go('checkin.home.programs');
						});
					}

					AttendanceSvc.save().then(function() {
						$log.log('student ' + $scope.studentId + ' is now checked in');

						if(student.message && student.message.value && student.message.value != '' && !student.message.viewed) {
							// load message to remove
							StudentSvc.read(student._id, {}, true).then(function(studentDoc) {
								$("#alert_template button").after('<span><strong>'+student.firstName+'</strong>: '+student.message.value+'</span>');
								$('#alert_template').fadeIn('slow');
								$('#alert_template button').click(function(){
									StudentSvc.current.message.viewed = Date.now();
									StudentSvc.save();
									dismissMessage();
								});


								window.setTimeout(function() {
									StudentSvc.current.message.viewed = Date.now();
									StudentSvc.save();
									dismissMessage();
								}, 5000);
							});

						} else {
							$state.go('checkin.home.programs');
						}

					}, function() {
						$log.log('student ' + $scope.studentId + ' is could not be checked in');
					});
				};
			}
		};

		return ttkdSwiperSlideItemStudent;
	}]);

});