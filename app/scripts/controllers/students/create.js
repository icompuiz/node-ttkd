define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', '$stateParams', 'StudentSvc', 'EmergencyContactSvc', 'WizardService',
		function($scope, $http, $log, $state, $stateParams, StudentSvc, EmergencyContactSvc, WizardService) {

			// Check if the state is changed... will need to terminate registered wizard
			$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
				var inWizard = /^(admin.students.create|admin.students.edit)/.test(toState.name);
				if (!inWizard) {
					StudentSvc.reset();

					if(!$scope.model.isNew) {
						WizardService.terminate('admin.students.edit');
					} else {
						WizardService.terminate('admin.students.create');
					}
				};

			});

			initStudentObject();

			/**
			 * The following code is used for posting student data
			 */
			// Create student
			function saveStudent() {
                // StudentSvc.init($scope.model);

                function uploadAvatarTask(uploadAvatarTaskDone) {

                    if ($scope.model.uploader && $scope.model.uploader.queue.length) {
                        $scope.model.uploader.onCompleteItem = function(item, response, status) {

                            console.log(item);
                            console.log(response);

                            if (200 === status) {
                                uploadAvatarTaskDone(null, response._id);
                            } else {
                                var error  = new Error('An error occurred while uploading the avatar');
                    			uploadAvatarTaskDone(error);
                            }

                        };
                        $scope.model.uploader.uploadAll();
                    } else {
                        uploadAvatarTaskDone();
                    }

                }

                function saveStudentModelTask(avatarId, saveStudentModelTaskDone) {

                    if (avatarId) {
                        $scope.model.avatar = avatarId;
                    }

                    $scope.model.uploader.destroy();
                    $scope.model.uploader = null;

                    StudentSvc.save().then(function(saved) {

                        saveStudentModelTaskDone(null, saved);

                    }, function() {
                    	var error  = new Error('An error occurred while saving the model');
                    	saveStudentModelTaskDone(error);
                    });

                }

                function afterWaterfall(err, student) {
                	if (!err) {
	                    $log.log('Successfully saved student _id: ' + student._id);
	                    StudentSvc.reset();
	                    $state.go('admin.students.home');
                	} else {
                		// handle upload error case
                		// handle save error case
                	}
                }

                var tasks = [uploadAvatarTask, saveStudentModelTask];


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
					    $scope.model = StudentSvc.init({});
					    $scope.isNew = true;
					    initEContacts(); // Init e-contact
					    initWizardObject(); // Init wizard
					} else {
					    StudentSvc.read($stateParams.id, {}, true).then(
					    	function(studentDoc) {
						    	$scope.model = studentDoc;
						    	$scope.isNew = false;
						    	initEContacts(); // Init e-contact
						    	initWizardObject(); // Init wizard
					    	}
					    );
					}
				} else {
					// Service already has a current student, get it
					$scope.model = StudentSvc.current;
					initEContacts();
					initWizardObject();
				}
			}

			// Wizard init
			function initWizardObject() {
				var wizardId = 'admin.students.create';

				if(!$scope.isNew) {
					wizardId = 'admin.students.edit';
				}

			    $scope.wizard = WizardService.get(wizardId);

				if (!$scope.wizard) {
					$scope.wizard = WizardService.create(wizardId, true);
					$state.go($scope.wizard.current.id); // go to the initial state of this progression
				}

				$scope.$watch('wizard.current', function(currentStep, previousStep) {
					if (currentStep && (currentStep.id !== previousStep.id)) {
						$state.go(currentStep.id);
					}
				});
			}

			// Emergency Contact init
			function initEContacts() {
				if(!$scope.model.emergencyContacts || $scope.model.emergencyContacts === null){
					$scope.model.emergencyContacts = [];
				}

				var econtactListLen = $scope.model.emergencyContacts.length;

				if(econtactListLen === 0) {
					$scope.model.emergencyContacts[0] = EmergencyContactSvc.init({});
				}

				if(econtactListLen <= 1) {
					$scope.model.emergencyContacts[1] = EmergencyContactSvc.init({});
				}
			}


			/**
			 * The following code is used for standard wizard (pattern) behavior.
			 */
			// Submit behavior
			$scope.submit = function() {
				if (!$scope.wizard.current.isFinalStep) {
					$scope.wizard.goFoward();
				} else {
					save();
				}
			};

			// Save behavior
			function save(){
				$scope.submitBtnDisabled = true;

				if($scope.isNew) {
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
		}
	]);

});
