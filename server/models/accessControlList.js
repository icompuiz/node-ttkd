'use strict';
var $mongoose = require('mongoose'),
		$async = require('async'),
		_ = require('lodash'),
		Schema = $mongoose.Schema;

var AccessControlListSchema = new Schema({
		users: [{
				type: $mongoose.Schema.Types.ObjectId,
				ref: 'UserAccessControlEntry'
		}],
		groups: [{
				type: $mongoose.Schema.Types.ObjectId,
				ref: 'GroupAccessControlEntry'
		}],
		model: {
				id: {
						type: $mongoose.Schema.Types.ObjectId
				},
				modelName: String
		},
		noadmin: {
				type: Boolean,
				default: false
		}
}, {
		collection: 'accesscontrollists'
});

AccessControlListSchema.statics.create = function(model, onCreate, noadmin) {

		console.log('model::accesscontrollist::create::enter');


		var accessControlList = new this({
				users: [],
				groups: [],
				noadmin: noadmin,
				model: {
						id: model._id,
						modelName: model.constructor.modelName
				}
		});

		function saveAcl(done) {

				console.log('model::accesscontrollist::create::saveAcl::enter');


				accessControlList.save(function(err) {

						if (err) {
								console.log('model::accesscontrollist::create::saveAcl::error', err.message || err);
								return done(err);
						}

						console.log('model::accesscontrollist::create::saveAcl::success');

						done();
				});

		}

		onCreate(accessControlList, saveAcl);


};



AccessControlListSchema.statics.addGroups = function(id, groupsToAdd, done) {

		var Group = $mongoose.model('Group'),
				GroupAccessControlEntry = $mongoose.model('GroupAccessControlEntry');
		
		var ACL = this;
		ACL.findOne({
				_id: id
		}).exec(function(err, acl) {

				if (err) {
						return done(err);
				}

				if (!acl) {
						err = new Error('ACL ' + id + ' not found');
						return done(err);
				}

				var groups = [];
				$async.each(groupsToAdd || [], function(groupData, processNextGroup) {

						var name = groupData.name || groupData;

						var groupQuery = Group.findOne({
								name: name
						});

						groupQuery.exec(function(err, group) {
								if (err) {
										return processNextGroup(err);
								}

								if (!group) {
										return processNextGroup('Group ' + name + ' not found');
								}

								var ace = new GroupAccessControlEntry({
										group: group._id,
										acl: id
								});

								if (groupData.access) {
										ace.access = groupData.access;
								}

								ace.save(function(err) {
										if (err) {
												return processNextGroup(err);
										}

										groups.push(ace._id);
										processNextGroup();
								});

						});


				}, function(err) {
						if (err) {
								return done(err);
						}

						ACL.findOneAndUpdate({
								_id: id
						}, {
								$push: {
										groups: {
												$each: groups
										}

								}
						}, {
								upsert: true,
								safe: true
						}, function(err) {


								if (err) {
										return done(err);
								}
								done(null, groups);
						});
				});

		});

};

AccessControlListSchema.statics.addUsers = function(id, usersToAdd, done) {

		var User = $mongoose.model('User'),
				UserAccessControlEntry = $mongoose.model('UserAccessControlEntry');

		var ACL = this;
		ACL.findOne({
				_id: id
		}).exec(function(err, acl) {

				if (err) {
						return done(err);
				}

				if (!acl) {
						return done('ACL ' + id + ' not found');
				}

				var users = [];
				$async.each(usersToAdd || [], function(userData, processNextUser) {

						var username = userData.username || userData;

						var userQuery = User.findOne({
								username: username
						});

						userQuery.exec(function(err, user) {
								if (err) {
										return processNextUser(err);
								}

								if (!user) {
										return processNextUser('User ' + username + ' not found');
								}

								var ace = new UserAccessControlEntry({
										user: user._id,
										acl: id
								});

								if (userData.access) {
										ace.access = userData.access;
								}


								ace.save(function(err) {
										if (err) {
												return processNextUser(err);
										}

										users.push(ace._id);
										processNextUser();
								});

						});


				}, function(err) {
						if (err) {
								return done(err);
						}

						ACL.findOneAndUpdate({
								_id: id
						}, {
								$push: {
										users: {
												$each: users
										}

								}
						}, {
								upsert: true,
								safe: true
						}, function(err) {
								if (err) {
										return done(err);
								}
								done(null, users);
						});
				});

		});


};

AccessControlListSchema.pre('save', function(done) {

		var accessControlList = this;

		var User = $mongoose.model('User'),
				Group = $mongoose.model('Group'),
				UserAccessControlEntry = $mongoose.model('UserAccessControlEntry'),
				GroupAccessControlEntry = $mongoose.model('GroupAccessControlEntry');

		var rootUser = User.findOne({
				username: 'root'
		});
		var administratorUser = User.findOne({
				username: 'administrator'
		});
		var administratorsGroup = Group.findOne({
				name: 'administrators'
		});

		function addRootUserACE(doneAddingRootUser) {
				console.log('model::accessControlList::pre::addRootUserACE::enter');

				rootUser.exec(function(err, root) {
						console.log('model::accessControlList::pre::addRootUserACE::findRoot::enter');
						if (err) {
								console.log('model::accessControlList::pre::addRootUserACE::findRoot::err', err);
								return doneAddingRootUser(err);
						}

						if (!root) {
								err = new Error('Fatal error: Could not find root user.');
								console.log('model::accessControlList::pre::addRootUserACE::findRoot::err', err);
								return doneAddingRootUser(err);
						}


						if (!_.isArray(accessControlList.users)) {
								accessControlList.users = [];
						}

						var ace = new UserAccessControlEntry();
						ace.user = root._id;
						ace.access = {
								all: true
						};

						ace.save(function(err) {
								if (err) {
										console.log('model::accessControlList::pre::addRootUserACE::findRoot::save::err', err);
										return doneAddingRootUser(err);
								}



								console.log('model::accessControlList::pre::addRootUserACE::findRoot::save::success');
								accessControlList.users.push(ace);
								doneAddingRootUser(null, ace);

						});
				});
		}

		function addAdministratorUserACE(doneAddingAdministratorUser) {
				console.log('model::accessControlList::pre::addAdministratorUserACE::enter');
				administratorUser.exec(function(err, administrator) {
						console.log('model::accessControlList::pre::addAdministratorUserACE::findAdministrator::enter');
						if (err) {
								console.log('model::accessControlList::pre::addAdministratorUserACE::findAdministrator::err', err);
								return doneAddingAdministratorUser(err);
						}

						if (!administrator) {
								err = new Error('Fatal error: Could not find administrator user.');
								console.log('model::accessControlList::pre::addAdministratorUserACE::findAdministrator::err', err);
								return doneAddingAdministratorUser(err);
						}

						if (!_.isArray(accessControlList.users)) {
								accessControlList.users = [];
						}

						var ace = new UserAccessControlEntry();
						ace.user = administrator._id;
						ace.access = {
								all: true
						};

						ace.save(function(err) {
								if (err) {
										console.log('model::accessControlList::pre::addAdministratorUserACE::findAdministrator::save::err', err);
										return doneAddingAdministratorUser(err);
								}
								console.log('model::accessControlList::pre::addAdministratorUserACE::findAdministrator::save::success');
								accessControlList.users.push(ace);
								doneAddingAdministratorUser(null, ace);
						});
				});
		}

		function addAdministratorsGroupACE(doneAddingAdministratorsGroup) {

				console.log('model::accessControlList::pre::addAdministratorGroupACE::enter');

				administratorsGroup.exec(function(err, administrators) {
						console.log('model::accessControlList::pre::addAdministratorGroupACE::findAdministratorGroup::enter');
						if (err) {
								console.log('model::accessControlList::pre::addAdministratorGroupACE::findAdministratorGroup::err', err);
								return doneAddingAdministratorsGroup(err);
						}

						if (!administrators) {
								err = new Error('Fatal error: Could not find administrators group.');
								console.log('model::accessControlList::pre::addAdministratorGroupACE::findAdministratorGroup::err', err);
								return doneAddingAdministratorsGroup(err);
						}

						if (!_.isArray(accessControlList.groups)) {
								accessControlList.groups = [];
						}

						var ace = new GroupAccessControlEntry();
						ace.group = administrators._id;
						ace.access = {
								all: true
						};
						ace.save(function(err) {
								if (err) {
										console.log('model::accessControlList::pre::addAdministratorGroupACE::findAdministratorGroup::save::err', err);
										return doneAddingAdministratorsGroup(err);
								}

								console.log('model::accessControlList::pre::addAdministratorGroupACE::findAdministratorGroup::save::success');
								accessControlList.groups.push(ace);
								doneAddingAdministratorsGroup(null, ace);
						});
				});
		}

		var tasks = {
				root: addRootUserACE
		};

		if (!accessControlList.noadmin) {
				tasks.administrator = addAdministratorUserACE;
				tasks.administrators = addAdministratorsGroupACE;
		}

		$async.series(tasks, function(err) {
				if (err) {
						console.log('model::accessControlList::pre::error', err);
						return done(err);
				}
				console.log('model::accessControlList::pre::success', accessControlList);

				done();
		});


});

AccessControlListSchema.pre('remove', function(preRemoveDone) {


		var AccessControlEntry = $mongoose.model('AccessControlEntry');

		AccessControlEntry.find({
				acl: this._id
		}).exec(function(err, aces) {
				console.log('model::accessControlList::pre::remove::eachACE::findById::enter');
				$async.each(aces, function(ace, removeNextItem) {

						ace.remove(removeNextItem);

				}, preRemoveDone);
		});

});

var AccessControlList = $mongoose.model('AccessControlList', AccessControlListSchema);
module.exports = AccessControlList;
