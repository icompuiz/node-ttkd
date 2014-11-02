define(['../module'], function (controllers) {

	controllers.controller('AchievementCtrl', ['$scope', '$modalInstance', 'attendanceInfo', 'AchievementSvc', 
		function($scope, $modalInstance, attendanceInfo, AchievementSvc) {
			$scope.attendance = attendanceInfo;

	        $scope.addAchievement = function(rank) {
	            var achievement = {
	                attendance: $scope.attendance._id,
	                student: $scope.attendance.student,
	                rank: rank._id,
	                program: rank.program,
	                class: $scope.attendance.classAttended,
	                dateAchieved: $scope.attendance.checkInTime
	            };

	            AchievementSvc.init(achievement);
	            AchievementSvc.create(true).then(function(newAchievement) {
	                console.log("ACHIEVEMENT ADDED");
	                $modalInstance.close();
	            });               
	        };

	        $scope.removeAchievement = function(achievement) {
	            AchievementSvc.read(achievement._id, null, true).then(function(ach) {
	                AchievementSvc.remove().then(function(removed) {
	                    console.log("ACHIEVEMENT REMOVED");
	                    $modalInstance.close();
	                });
	            })
	        };

	        $scope.expand = function(e, i){
	        	$scope.subrankObjs = $scope.attendance.sortedSubranks[i];

				var current=$(e.target).next();
				var grandparent=$(e.target).parent().parent();
				if($(e.target).hasClass('left-caret')||$(e.target).hasClass('right-caret'))
					$(e.target).toggleClass('right-caret left-caret');
				grandparent.find('.left-caret').not(e.target).toggleClass('right-caret left-caret');
				grandparent.find(".sub-menu:visible").not(current).hide();
				current.toggle();
				e.stopPropagation();
			};

			// $(".dropdown-menu li a:not(.trigger)").on("click",function(){
			// 	var root=$('.trigger').closest('.dropdown');
			// 	root.find('.left-caret').toggleClass('right-caret left-caret');
			// 	root.find('.sub-menu:visible').hide();
			// });
	}]);

});