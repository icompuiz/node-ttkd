define(['./module'], function(filters) {
  'use strict';

  filters.filter('phoneNumber', ['$log', function() {
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
  }]);
});