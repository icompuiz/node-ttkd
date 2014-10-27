define(['./module'], function(directives){
	'use strict';

	return directives.directive('ttkdSwiper', ['$log', '$compile', function ($log, $compile) {
		var compileHack = $compile;
		var rcvd = false;
		var ttkdSwiper = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper',
			scope: {
				type: '=',
				selectedClassId: '='
			},

			controller: function($scope, ProgramSvc, ClassSvc, StudentSvc, $compile) {
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
										});
								});
							}],

							function(err){
								$scope.data = {
									students: data,
									type: 'students'
								};
								// $scope.allStudents = data;
								// $scope.filterStudents(['A','B','C','D','M','T'], 'firstName');
							});
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

							$scope.data = {
								classes: data,
								'type': 'class'
							};
						});
					});
				}

				$scope.test = function(items){
					$log.log('test');
				};

			},

			link: function($scope, element) {
				$scope.$watch('data', function() {
					var swiperParent;

					if($scope.type === 'students') {
						swiperParent = new Swiper('.swiper-parent', {
							mode: 'horizontal',
							grabCursor: true
						});
					} else {
						if($scope.data.length == 0) {
							return;
						}

						swiperParent = new Swiper('.swiper-parent', {
							mode: 'vertical',
							slidesPerView: 3,
							centeredSlides: true,
							watchActiveIndex: true,
							grabCursor: true
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

			controller: ['$scope', function($scope) {}],

			link: function($scope, element) {
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
					var className = item.classObjs[j].name;
					var classId = item.classObjs[j]._id;
					$scope.classes[classId] = item.classObjs[j];
					//name="\''+className+'\'"
					var newHSlide = newLateralSwiperWrapper.createSlide('<div ttkd-swiper-slide-item-class classes="classes" id="\''+classId+'\'"></div>', 'swiper-slide');
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
			templateUrl: 'partials/checkin/class/class',
			replace:true,
			scope: {
				parent: '=',
				items: '=',
				swiperId: '=',
				type: '='
			},

			controller: ['$scope', function($scope) {
				$scope.filterStudents = function(filter, filterParam) {
					var maxLateralSlideDeck = 9;
					var allStudents = $scope.items;
					var filtered = allStudents;

					if(filter) {
						filtered = _.filter(data, function (student) {
							return _.contains(filter, student[filterParam][0]);
						});
					}

					if(filterParam) {
						// and sort...
						filtered = _.sortBy(filtered, function(student) {
							return student[filterParam];
						});
					}

					var returnableFiltered = [];
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
			}],


			link: function($scope, element) {
				var item = $scope.item;
				
				var slideClassName = 'swiper-nested-' + $scope.swiperId;

				//create a parent swiper for horizontal movement
				$scope.filterStudents();
				$scope.students = $scope.studentsFiltered;
				$scope.studentsCopy = $scope.studentsFiltered;

				var swiperParent = $scope.parent;
				$scope.swiperParent = swiperParent;


				// for(var i=0; i<$scope.students.length; i++) {
					
				// 	var html = '<div ng-repeat="student in studentsCopy.students.splice(0, 9)" ttkd-swiper-slide-item-student student="student"></div>';

				// 	var lateralSwiperWrapper = swiperParent.createSlide(html, 'swiper-slide');
				// 	lateralSwiperWrapper.append();

				// 	compileHack(lateralSwiperWrapper)($scope);
				// }



				// var lateralSwiperWrapper = swiperParent.createSlide('<div class="swiper-container nested '+slideClassName+'"><div class="swiper-wrapper nested" style="color:black">Test</div></div>', 'swiper-slide');
				// lateralSwiperWrapper.append();

				// var lateralSwiperWrapper = swiperParent.createSlide('<div class="swiper-container nested '+slideClassName+'"><div class="swiper-wrapper nested" style="color:black">Test</div></div>', 'swiper-slide');
				// lateralSwiperWrapper.append();

				//var lateralHeight;
				//if(swiperParent.slides.length > 0){
				//	lateralHeight = swiperParent.slides[0].style.height;
				//}


				// for(var j=0; j<item.students.length; j++) {
				//      var studentName = item.students[j].firstName + ' ' + item.students[j].lastName;
				//      var studentId = item.students[j]._id;
				//      $scope.students[studentId] = item.students[j];
				// }
			}
		};

		return ttkdSwiperLateralItemStudent;
	}])

	.directive('ttkdSwiperLateralItemStudentSubset', ['$log', function ($log) {
		return {
			restrict: 'A',
			scope: {
				parent: '='
			},
			controller: function($scope) {
				//hack to fix reInit
				$scope.parent.reInit = function (forceCalcSlides) {
					var _this = $scope.parent;

					var oldSubChildren = _this.wrapper.childNodes;
					var target;

					for(var i = 0; i<oldSubChildren.length; i++) {
						var sub = oldSubChildren[i];

						if(sub.id === 'studentholder') {
							target = i;
						}
					}

					if(target) {
						for(var i=0; i<_this.wrapper.childNodes[target].childNodes.length; i++) {
							if(_this.wrapper.childNodes[target].childNodes[i].nodeName !== '#comment')
								_this.wrapper.appendChild(_this.wrapper.childNodes[target].childNodes[i]);
						}
					}


					_this.init(true, forceCalcSlides);
				};
			},
			link: function ($scope, element) {
				$log.log('hit');
				$scope.parent.reInit();
			}
		};
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
					$state.go('checkin.home.unranked', {id: $scope.classId});
				}
			},

			link: function($scope) {}
		};

		return ttkdSwiperSlideItemClass;
	}])

	.directive('ttkdSwiperSlideItemStudent', ['$log', function($log) {
		var ttkdSwiperSlideItemStudent = {
			restrict: 'A',
			templateUrl: 'partials/checkin/class/students',
			scope: {
				student: '='
			},
			replace:true,

			controller: function($scope) {
				$scope.studentName = $scope.student.firstName + ' ' + $scope.student.lastName;
				$scope.studentAvatar = $scope.student.avatar;
				$scope.studentContinue = function() {
					$log.log('hit again student ' + $scope.student._id);
				}
			},

			link: function($scope, element) {
				$log.log('t');
			}
		};

		return ttkdSwiperSlideItemStudent;
	}]);

});