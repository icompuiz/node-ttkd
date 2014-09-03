define(['./module'], function(services) {
		'use strict';
		services.service('AuthenticationSvc', ['$http', '$rootScope', '$log', '$q',
				function($http, $rootScope, $log, $q) {

						var publicUser = {
								username: 'public',
								fullname: 'public',
								assets: {
										'/login': true
								}
						};

						var auth = {
								currentUser: publicUser,
								authorize: function(asset) {
										var isAllowed = auth.currentUser.assets[asset] || false;

										return isAllowed;
								},
								isLoggedIn: function() {

										var isLoggedIn = false;
										if (auth.currentUser.username !== publicUser.username) {
												isLoggedIn = true;
										}
										return isLoggedIn;

								},
								login: function(credentials) {

										var promise = $q.defer();

										$http.post('/login', credentials).then(function(data) {

												$log.log('Logged in', data);

												auth.currentUser = data.data;

												promise.resolve(auth.currentUser);

										}, function(error) {

												$log.log('Error While Logging In', error);

												promise.reject(error);

										});

										return promise.promise;

								},
								logout: function() {

										var promise = $q.defer();

										$http.get('/logout').then(function(data) {
												$log.log('Logged out', data);
												auth.currentUser = publicUser;
												promise.resolve(data);
										});

										return promise.promise;

								}
						};


						function updateCurrentUser() {

								$.ajax('/me', {
										method: 'GET',
										async: false,
										success: function(user) {
												auth.currentUser = user;
										},
										error: function() {
												auth.currentUser = publicUser;
										}
								});
						}

						updateCurrentUser();

						$rootScope.$on('$stateChangeSuccess', updateCurrentUser);

						return auth;

				}
		]);

});
