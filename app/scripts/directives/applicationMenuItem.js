define(['./module'], function (directives) {
    'use strict';

    return directives.directive('applicationMenuItem', ['$rootScope', '$state', function($rootScope, $state) {

        var applicationMenuItemDtv = {
            restrict: 'A',
            scope: {
                uiSref: '='
              },
              link: function($scope, tElement, tAttr) {

                function setActive(isActive) {
                    var parent = tElement.parent('li');
                    if (isActive) {
                      parent.addClass('active');
                    } else {
                      parent.removeClass('active');
                    }
                  }

                $scope.active = $state.is(tAttr.uiSref);
                setActive($scope.active);

                $scope.$on('$stateChangeSuccess', function() {
                    $scope.active = $state.is(tAttr.uiSref);
                    setActive($scope.active);
                  });
              }
            };
        return applicationMenuItemDtv;
      }]);
  });