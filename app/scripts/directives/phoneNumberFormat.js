define(['./module'], function (directives) {
    'use strict';

    return directives.directive('phoneNumberInput', ['$filter', '$browser', function($filter, $browser) {

      return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
          var listener = function() {
            var value = $element.val().replace(/-/g, '');
            if(value === '') {
              $element.val('');
            } else {
              $element.val($filter('phoneNumber')(value));
            }
          };

          // This runs when we update the text field
          ngModelCtrl.$parsers.push(function(viewValue) {
            return viewValue.replace(/-/g, '');
          });

          // This runs when the model gets updated on the scope directly and keeps our view in sync
          ngModelCtrl.$render = function() {
            $element.val($filter('phoneNumber')(ngModelCtrl.$viewValue));
          };

          $element.bind('keyup', listener);

          $element.bind('paste cut', function() {
            $browser.defer(listener);
          });
        }
      };

    }]).filter('phoneNumber', function() {
      return function(input) {
        input = input || '';
        var out = '';

        for (var i = 0; i < input.length; i++) {
          if(i === 3){
            out = out + '-';
          }
          if(i === 6){
            out = out + '-';
          }

          out = out + input.charAt(i);
        }

        return out;
      };
    });

  });