define(['./module'], function(directives){
	'use strict';

	return directives.directive('ttkdSwiper', ['$log', function ($log) {

		var ttkdSwiper = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper',
			scope: {
				type: '=',
				classId: '='

			},

			controller: function($scope, ProgramSvc, ClassSvc) {
				// Load data based on type
				$scope.data = [];

				if($scope.type === 'students') {
					$log.log('Attempting to load students...');


				} else {
					$log.log('Attempting to load programs...');
					loadProgramsAndClasses();
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
				item: '=program',
				swiperId: '=',
				type: '='
			},

			controller: ['$scope', function($scope) {
			


			}],

			link: function($scope, element) {
				if($scope.type === 'students') {

				} else {

				}


				var program = $scope.item;
				var swiperParent = $scope.parent;
				var slideClassName = 'swiper-nested-' + $scope.swiperId;

				//create a parent swiper for horizontal movement
				var rowTitle = '<div class="title">' + program.name + '</div>';
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

				for(var j=0; j<program.classObjs.length; j++) {
					var className = program.classObjs[j].name;
					var classId = program.classObjs[j]._id
					var newHSlide = newLateralSwiperWrapper.createSlide('<div ttkd-swiper-slide-item-class name="\''+className+'\'" id="\''+classId+'\'"></div>', 'swiper-slide red-slide');					
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

		return ttkdSwiperLateralItem;
	}])

	.directive('ttkdSwiperSlideItemClass', ['$log', function($log) {
		var ttkdSwiperSlideItemClass = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper-card-class',
			scope: {
				className: '=name',
				classId: '=id'
			},
			replace:true,

			controller: function($scope) {
				$scope.classContinue = function() {
					$log.log('hit again ' + $scope.classId);
				}
			},

			link: function($scope) {
				

			}
		};

		return ttkdSwiperSlideItemClass;
	}]);

});