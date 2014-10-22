define(['./module'], function(directives){
	'use strict';

	return directives.directive('ttkdSwiper', ['$log', function ($log) {

		var ttkdSwiper = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper',
			scope: {
				type: '=',
				selectedClassId: '='

			},

			controller: function($scope, ProgramSvc, ClassSvc, StudentSvc) {
				// Load data based on type
				$scope.data = [];

				// store students so we don't need to reload
				$scope.allStudents = [];

				if($scope.type === 'students' && $scope.selectedClassId) {
					$log.log('Attempting to load students...');

					loadStudents($scope.selectedClassId);

				} else {
					$log.log('Attempting to load programs...');
					loadProgramsAndClasses();
				}

				$scope.filterStudents = function(filter, filterParam, maxLateralSlideDeck) {
	                var data = $scope.allStudents;


					var filtered = data;

					if(filter && filterParam) {
						filtered = _.filter(data, function (student) {
							return _.contains(filter, student[filterParam][0]);
						});
					}

					if(!maxLateralSlideDeck) {
						maxLateralSlideDeck = 8;
					}

					var returnableFiltered = [];

					var neededLaterals = Math.ceil(filtered.length / maxLateralSlideDeck);
					for(var i=0; i<neededLaterals; i++) {
						var howMany;
						if(i+1 === neededLaterals) {
							howMany = filtered.length - (i * maxLateralSlideDeck);
						} else {
							howMany = maxLateralSlideDeck;
						}

						returnableFiltered.push({
							students: filtered.splice(i*maxLateralSlideDeck, howMany)
						});
					}

					$scope.data = returnableFiltered;
				};

				function loadStudents(selectedClassId) {
	                var data = [];

					ClassSvc.read(selectedClassId, null, false).then(function(c){
						async.parallel([
							function(callback, err){
								var returns = 0;

								_.each(c.students, function(s){
									async.parallel([
										function(studentCallback, studentErr) {
											StudentSvc.read(s, null, false).then(function(student) {
						                        data.push(student);
						                        returns += 1;
						                        studentCallback();
						                    });
										}],
										function(studentErr) {
											if(returns === c.students.length) {
												callback();
											}
										}
									);
								});
							}],

							function(err){
								$scope.allStudents = data;

								$scope.filterStudents();
							}
						);
					});
				}

				function loadProgramsAndClasses() {
					var data = [];

					ProgramSvc.list().then(function(programs){
						async.parallel([
							function(callback, err){
								//Get class objects and put into programs
								ClassSvc.list().then(function(classes){
									var i;
									for(i=0; i<programs.length; i++) {
										programs[i].classes = _.where(classes, {'program': programs[i]._id});
									}
									callback();
								});
							}],

							function(err){
								_.each(programs, function(p){
									data.push({
										'classObjs': p.classes,
										'name': p.name,
										'classNames': _.map(p.classes, function(c){return c.name;}),
										'_id': p._id
									});
								});

								$scope.data = data;
							}
						);
					});
				}
			},

			link: function($scope) {
				$scope.$watch('data', function() {

					var lateralSwipersNested = [];

					var swiperParent = new Swiper('.swiper-parent', {
						mode: 'vertical',
						slidesPerView: 3,
						centeredSlides: true,
						watchActiveIndex: true
					});

					$scope.swiperParent = swiperParent;

					var lateralHeight;

				}, true);
			}
		};

		return ttkdSwiper;
	}])

	.directive('ttkdSwiperLateralItem', ['$log', '$compile', function($log, $compile) {
		var compileHack = $compile;
		var ttkdSwiperLateralItem = {
			restrict: 'A',
			scope: {
				parent: '=',
				item: '=',
				swiperId: '=',
				type: '='
			},

			controller: ['$scope', function($scope) {
			


			}],

			link: function($scope, element) {
				var item = $scope.item;
				var swiperParent = $scope.parent;
				var slideClassName = 'swiper-nested-' + $scope.swiperId;

				var itemTitle;


				if($scope.type === 'students') {
					var itemTitle = 'TEST';
				} else {
					var itemTitle = item.name;
				}


				//create a parent swiper for horizontal movement
				var rowTitle = '<div class="title">' + itemTitle + '</div>';
				var lateralSwiperWrapper = swiperParent.createSlide(rowTitle + '<div class="swiper-container nested '+slideClassName+'"><div class="swiper-wrapper nested"></div></div>', 'swiper-slide');

				lateralSwiperWrapper.append();

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
				$scope.students = {};

				if($scope.type === 'students') {
					for(var j=0; j<item.students.length; j++) {
						var studentName = item.students[j].firstName + ' ' + item.students[j].lastName;
						var studentId = item.students[j]._id;
						$scope.students[studentId] = item.students[j];
						var newHSlide = newLateralSwiperWrapper.createSlide('<div ttkd-swiper-slide-item-student students="students" id="\''+studentId+'\'"></div>', 'swiper-slide red-slide');
						newHSlide.append();

						compileHack(newHSlide)($scope);

						resizeLateralSlides(newLateralSwiperWrapper, lateralHeight);
					}
				} else {
					for(var j=0; j<item.classObjs.length; j++) {
						var className = item.classObjs[j].name;
						var classId = item.classObjs[j]._id;
						$scope.classes[classId] = item.classObjs[j];
						//name="\''+className+'\'"
						var newHSlide = newLateralSwiperWrapper.createSlide('<div ttkd-swiper-slide-item-class classes="classes" id="\''+classId+'\'"></div>', 'swiper-slide red-slide');
						newHSlide.append();

						compileHack(newHSlide)($scope);

						resizeLateralSlides(newLateralSwiperWrapper, lateralHeight);
					}
				}


				//calculateHeight not working... quick/hacky fix
				function resizeLateralSlides(swiper, newHeight) {
					for(var i=0; i<swiper.slides.length; i++) {
						swiper.slides[i].style.height = newHeight;
					}
				}
			}
		};

		return ttkdSwiperLateralItem;
	}])

	.directive('ttkdSwiperSlideItemClass', ['$log', '$state', function($log, $state) {
		var ttkdSwiperSlideItemClass = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper-card-class',
			scope: {
				classId: '=id',
				classes: '='
			},
			replace:true,

			controller: function($scope) {
				$scope.className = $scope.classes[$scope.classId].name;
				$scope.classContinue = function() {
					$log.log('hit again ' + $scope.classId);
					$state.go('checkin.home.unranked');
				}
			},

			link: function($scope) {


			}
		};

		return ttkdSwiperSlideItemClass;
	}])

	.directive('ttkdSwiperSlideItemStudent', ['$log', function($log) {
		var ttkdSwiperSlideItemStudent = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper-card-student',
			scope: {
				studentId: '=id',
				students: '='
			},
			replace:true,

			controller: function($scope) {
				$scope.studentName = $scope.students[$scope.studentId].firstName + ' ' + $scope.students[$scope.studentId].lastName;
				$scope.studentAvatar = $scope.students[$scope.studentId].avatar;
				$scope.studentContinue = function() {
					$log.log('hit again student ' + $scope.studentId);
				}
			},

			link: function($scope, element) {
				$log.log('t');

			}
		};

		return ttkdSwiperSlideItemStudent;
	}]);

});