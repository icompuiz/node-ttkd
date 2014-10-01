define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', '$stateParams', 'StudentSvc', 'EmergencyContactSvc', 'WizardService','$timeout',
		function($scope, $http, $log, $state, $stateParams, StudentSvc, EmergencyContactSvc, WizardService, $timeout) {

			// Check if the state is changed... will need to terminate registered wizard
			$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
				var inWizard = /^(admin.students.create|admin.students.edit)/.test(toState.name);
				if (!inWizard) {
					StudentSvc.reset();

					if(/edit/.test(fromState.name)) {
						WizardService.terminate('admin.students.edit');
					} else {
						WizardService.terminate('admin.students.create');
					}
				};

			});


			var mockStudent = {
			    "emergencyContacts": [{
			        "name": "sdssd",
			        "phoneNumber": "5555555555",
			        "relationship": "Mother"
			    }, {
			        "name": "dsdsd",
			        "phoneNumber": "6666666666",
			        "relationship": "Father"
			    }],
			    "class": "5428ae901ac91384234e306a",
			    "firstName": "John",
			    "lastName": "Smith",
			    "address": {
			        "street": "1 Lomb Memorial Drive",
			        "city": "Rochester",
			        "zip": "14623"
			    },
			    "phone": {
			        "home": "1111111112",
			        "cell": "2222222222"
			    },
			    "emailAddress": "ttkd@gmail.com",
			    "birthday": "2014-09-12T04:00:00.000Z",
			    "waiver": {
			        "guardian": "dsdsd",
			        "participant": "sddssd"
			    },
			};


			/**
			 * The following code is used for controller level validation logic
			 */
			// Validation functions can be placed in individual sub-controllers
			var validationFunctions = [];

			// To add a function to be invoked on the submit call, use:
			// $scope.addValidationFunction(functionName)
			$scope.addValidationFunction = function(fct) {
				validationFunctions.push(fct);
			};

			// The following is called when the form is submitted
			function studentLogicValidates() {
				var passes = true;

				_.forEach(validationFunctions, function(fct) {
					passes = passes && fct();
				});

				return passes;
			}


			/**
			 * The following code is used for posting student data
			 */
			// Create student
			function saveStudent() {
                // StudentSvc.init($scope.model);

                function mapEmailAddressesTask(mapEmailAddressesTaskDone) {
					//convert emails
					
					$scope.model.emailAddresses = $scope.model.tmpEmailAddresses.map(function(emailObj) {
						return emailObj.value;
					});

					// for(var i=0; i<$scope.model.tmpEmailAddresses.length; i++) {
					// 	$scope.model.emailAddresses[i] = $scope.model.tmpEmailAddresses[i].value;
					// }

					return mapEmailAddressesTaskDone(null);
                }

                function uploadAvatarTask(uploadAvatarTaskDone) {

                    if ($scope.model.uploader && $scope.model.uploader.queue.length) {
                    	$scope.model.uploader.queue[0].formData = [{ name: new Date().getTime().toString() }];
                        $scope.model.uploader.onCompleteItem = function(item, response, status) {

                            console.log(item);
                            console.log(response);

                            if (200 === status) {
                                uploadAvatarTaskDone(null, response._id);
                            } else {
                                var error  = new Error('An error occurred while uploading the avatar');
                    			uploadAvatarTaskDone(error, null);
                            }

                        };
                        $scope.model.uploader.uploadAll();
                    } else {
                        uploadAvatarTaskDone(null, false);
                    }

                }

                function saveStudentModelTask(avatarId, saveStudentModelTaskDone) {

                    if (avatarId) {
                        $scope.model.avatar = avatarId;
                    }
                    
                    if (angular.isDefined($scope.model.uploader)) {
	                    $scope.model.uploader.destroy();
	                    $scope.model.uploader = null;
                    }

                    StudentSvc.save().then(function(saved) {

                        saveStudentModelTaskDone(null, saved);

                    }, function() {
                    	var error  = new Error('An error occurred while saving the model');
                    	saveStudentModelTaskDone(error);
                    });

                }

                function afterWaterfall(err, student) {
                	if (!err) {

	                    StudentSvc.reset();
	                    if ($stateParams.classId) {
	                    	$state.go('admin.programs.viewclass', { id: $stateParams.classId });
	                    } else {
	                    	$state.go('admin.students.home');
	                    }

                	} else {
	                    $log.log('Failed to save student');
                    	$scope.submitBtnContent = 'Failed to save student';
	                    $scope.wizard.end();

	                    $timeout(function() {
							$scope.submitBtnContent = 'Submit Registration';
							$scope.submitBtnDisabled = false;
	                    }, 2000);
                		// handle upload error case
                		// handle save error case
                	}
                }

                var tasks = [mapEmailAddressesTask, uploadAvatarTask, saveStudentModelTask];


                async.waterfall(tasks, afterWaterfall);
            }


			/**
			 * The following code is used for initialization.
			 */
			// Student init
			function initStudentObject() {
				if (!StudentSvc.current) {
					// There may be an existing student id so try and load
					if (_.isEmpty($stateParams.id)) {
					    $scope.model = StudentSvc.init(mockStudent || {});
					    initWizardObject(); // Init wizard
					} else {
					    StudentSvc.read($stateParams.id, {}, true).then(
					    	function(studentDoc) {
						    	$scope.model = studentDoc;
						    	initWizardObject(); // Init wizard
					    	}
					    );
					}
				}
			}

			// Wizard init
			function initWizardObject() {

				if ($stateParams.classId) {
					$scope.model.class = $stateParams.classId;
				}

				var wizardId = $state.$current.name;

			    $scope.wizard = WizardService.get(wizardId);

				if (!$scope.wizard) {
					$scope.wizard = WizardService.create(wizardId, true);
				}
				
				$state.go($scope.wizard.current.id); // go to the initial state of this progression

				$scope.$watch('wizard.current', function(currentStep, previousStep) {
					if (currentStep && (currentStep.id !== previousStep.id)) {
						$state.go(currentStep.id);
					}
				});
			}





			$scope.displayPreviousBtn = function() {
				return $scope.wizard.peekPreviousIndex();
			};
			// Emergency Contact init



			/**
			 * The following code is used for standard wizard (pattern) behavior.
			 */
			// Submit behavior
			$scope.submit = function() {
				if(!studentLogicValidates()) {
					$log.log('Validation failed');
					return false;
				}


				if (!$scope.wizard.current.isFinalStep) {
					$scope.wizard.goFoward();
				} else {
					$log.log($scope.model);
					save();
				}
			};

			// Save behavior
			function save(){
				$scope.submitBtnDisabled = true;

				$log.log($scope);

				if(!angular.isDefined($scope.model._id)) {
					$scope.submitBtnContent = 'Creating Student...';
				} else {
					$scope.submitBtnContent = 'Updating Student...';
				}
				saveStudent();
			}

			// Reset behavior
			$scope.showResetConfirm = false;

			$scope.reset = function() {
				$scope.showResetConfirm = true;
			};

			$scope.confirmReset = function(resetConfirmed) {
				$scope.showResetConfirm = false;

				if (resetConfirmed) {
					StudentSvc.reset();
					initStudentObject();
					$scope.wizard.reset();
					$scope.createStudent.$setPristine();
				}
			};

			
			// Next button behaviors
			$scope.displayPreviousBtn = function() {
				if(!$scope.wizard || $scope.wizard === null) {
					return false;
				} else if($scope.wizard.peekPreviousIndex() === false) {
					return false;
				} else {
					return true;
				}
			};

			$scope.displayContinueBtn = function() {
				return $scope.wizard.peekNextIndex();
			};

			$scope.submitBtnContent = 'Submit Registration';

			initStudentObject();
		}
	]);

});
