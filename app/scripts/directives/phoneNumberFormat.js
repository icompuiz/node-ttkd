define(['./module'], function (directives) {
    'use strict';

    return directives.directive('phoneNumberInput', ['$filter', '$log', '$browser', function($filter, $log, $browser) {

      function isNaturalNumber(n) {
        n = n.toString(); // force the value incase it is not
        var n1 = Math.abs(n),
        n2 = parseInt(n, 10);
        return !isNaN(n1) && n2 === n1 && n1.toString() === n;
      }

      return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
          var keyedUp = true;
          var lastKey = null;

          var listener = function() {
            var value = $element.val().replace(/-/g, '');
            keyedUp = true;
            if(value === '') {
              $element.val('');
            } else {
              $element.val($filter('phoneNumber')(value));
            }
          };

          var keydownListener = function(e) {
            if(!keyedUp && lastKey === e.keyCode) {
              // the same button may have been keyed twice...
              // need to key up, or hit a different key (same ppl are quick with num pad)
              e.preventDefault();
              return false;
            }

            keyedUp = false;
            lastKey = e.keyCode;

            var tmpVal = String.fromCharCode(e.keyCode);
            if(isNaturalNumber(tmpVal)) {
              return true;
            } else {
              $log.log(tmpVal + ' is not a natural number for ph #');
              e.preventDefault();
              return false;
            }
          };

          // This runs when we update the text field
          ngModelCtrl.$parsers.push(function(viewValue) {
            if(viewValue && viewValue !== null) {
              return viewValue.replace(/-/g, '');
            } else {
              return viewValue;
            }
          });

          // This runs when the model gets updated on the scope directly and keeps our view in sync
          ngModelCtrl.$render = function() {
            $element.val($filter('phoneNumber')(ngModelCtrl.$viewValue));
          };

          $element.bind('keyup', listener);
          $element.bind('keypress', keydownListener);

          $element.bind('paste cut', function() {
            $browser.defer(listener);
          });
        }
      };

    }]);

  });