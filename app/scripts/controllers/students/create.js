define(['../module'], function(controllers) {
	'use strict';

	controllers.controller('CreateStudentCtrl', ['$scope', '$http', '$log', '$state', '$stateParams', 'StudentSvc', 'EmergencyContactSvc', 'WizardService',
		function($scope, $http, $log, $state, $stateParams, StudentSvc, EmergencyContactSvc, WizardService) {


			// Create student object
			function initStudentObject() {
				if (!StudentSvc.current) {
					// may be an existing student... try and load
					if (_.isEmpty($stateParams.id)) {
					    $scope.model = StudentSvc.init({});
					    $scope.isNew = true;
					    initOtherData();
					    // initialize wizard or pull existing wizard here
					    initializeWizard();
					} else {
					    StudentSvc.read($stateParams.id, {}, true).then(function(studentDoc) {
					    	// initialize wizard or pull existing wizard here
					    	$scope.model = studentDoc;
					    	$scope.isNew = false;
					    	initOtherData();
					    	initializeWizard();
					    });
					}
				} else {
					$scope.model = StudentSvc.current;
					initOtherData();
					initializeWizard();
				}
			}

			function initializeWizard() {
			    $scope.wizard = WizardService.get('admin.students.create');

				if (!$scope.wizard) {
					$scope.wizard = WizardService.create('admin.students.create', true);
					$state.go($scope.wizard.current.id); // go to the initial state of this progression
				}

				$scope.$watch('wizard.current', function(currentStep, previousStep) {
					if (currentStep && (currentStep.id !== previousStep.id)) {
						$state.go(currentStep.id);
					}
				});
			}

			initStudentObject();

			function initOtherData() {
				if($scope.model.emergencyContacts){
					//Add e contact
					$scope.econtact = [];

					async.each($scope.model.emergencyContacts,
						function(contact, callback) {
							EmergencyContactSvc.read(contact, {}, true).then(function(eDoc) {
								$scope.econtact.push({
									name: eDoc.name,
									phoneNumber: eDoc.phoneNumber,
									relationship: eDoc.relationship
								});
							});
						}, function(err) {}
					);
				} else {
					$scope.econtact = [];
					$scope.econtact[0] = {};
					$scope.econtact[1] = {};
				}
			}

			var econtactIds = [];

			function updateContacts(id, model) {
				EmergencyContactSvc.read(id, {}, true).then(function(eDoc) {
				   	eDoc.name = model.name;
				   	eDoc.phoneNumber = model.phoneNumber;
				   	eDoc.relationship = model.relationship;

				   	return EmergencyContactSvc.update({}, function(){
				   		return true;
				   	});
				});
			}

			function addNewContacts(callback, err) {
				//Add e contact
				var curr = 0;

				async.each($scope.econtact,
					function(contact, callback) {
						var econtactToAdd = {
							name: contact.name,
							phoneNumber: contact.phoneNumber,
							relationship: contact.relationship
						};

						if($scope.model.emergencyContacts.length > curr && $scope.model.emergencyContacts[curr] != null) {
							updateContacts($scope.model.emergencyContacts[curr], econtactToAdd);
							econtactIds.push($scope.model.emergencyContacts[curr]);
							curr = curr + 1;
							callback();
						} else {
							//POST each new econtact and add object ID to array
							EmergencyContactSvc.init(econtactToAdd);
							EmergencyContactSvc.create(true).then(function(contactAdded, err){
								econtactIds.push(contactAdded._id);
								callback();
							});
						}
					},
					function(err) {
						callback();
					}
				);
			}

			var studentAdded = null;

			function addStudent() {
				StudentSvc.init($scope.model);
				StudentSvc.create(true).then(function(added) {
					studentAdded = added;
					//Add econtacts to db
					(function(econtactIds){
						async.parallel([
							addNewContacts],
							function(err) {
								//Add econtact references and update student
								StudentSvc.read(studentAdded._id, {}, true).get().then(function(p){
									function beforeSave(c) {
										c.emergencyContacts = econtactIds;
									}
									StudentSvc.save(beforeSave).then(function(saved) {
										$log.log('Successfully saved student _id: ' + saved._id);
										StudentSvc.reset();
										$state.go('admin.students.home');
									});
								});
						});
					})(econtactIds);
				});
			}

			function updateStudent() {
				StudentSvc.init($scope.model);
				StudentSvc.update({}, function(){/* before update*/}).then(function(added) {
					studentAdded = added;
					//Add econtacts to db
					(function(econtactIds){
						async.parallel([
							addNewContacts],
							function(err) {
								//Add econtact references and update student
								StudentSvc.read(studentAdded._id, {}, true).get().then(function(p){
									function beforeSave(c) {
										c.emergencyContacts = econtactIds;
									}
									StudentSvc.save(beforeSave).then(function(saved) {
										$log.log('Successfully saved student _id: ' + saved._id);
										StudentSvc.reset();
										$state.go('admin.students.home');
									});
								});
						});
					})(econtactIds);
				});
			}

			$scope.displayPreviousBtn = function() {
				return $scope.wizard.peekPreviousIndex();
			};

			$scope.displayContinueBtn = function() {
				return $scope.wizard.peekNextIndex();
			};

			$scope.submitBtnContent = 'Submit Registration';

			$scope.submit = function() {
				// check for ng form validity

				if (!$scope.wizard.current.isFinalStep) {
					$scope.wizard.goFoward();
				} else {
					$scope.submitBtnDisabled = true;

					if($scope.isNew) {
						$scope.submitBtnContent = 'Creating Student...';
						addStudent();
					} else {
						$scope.submitBtnContent = 'Updating Student...';
						updateStudent();
					}
				}
			};

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
		}
	]);

});
