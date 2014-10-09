/**
 * Defines the main routes in the application.
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['./module'], function (controllers) {
    'use strict';

    return controllers.config([function() {}]).run(['$rootScope','$state', 'AuthenticationSvc', function($rootScope, $state, AuthenticationSvc) {
		  $rootScope.logout = function() {
			  AuthenticationSvc.logout().then(function() {
				  $state.go('login');
			  });
		  };
	  }]);
  });