'use strict';

var _ = require('lodash'),
	$mongoose = require('mongoose'),
	$async = require('async'),
	$config = require('../configuration/initialize').config,
	Schema = $mongoose.Schema,
	$passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
	// username: String
	fullname: String,
	email: String
});

userSchema.methods.addToGroups = function(groups, done) {

	var user = this;

	console.log('UserModel::addToGroups::enter::Adding user', user.username, 'to groups');
	if (_.isString(groups)) {
		groups = [groups];
	}

	if (!_.isArray(groups)) {
		var err = new Err('acceptable types for groups are String or Array');
		console.log('UserModel::addToGroups::error', groups, err.message);
		return done(err);
	}

	var Group = $mongoose.model('Group');

	$async.each(groups, function(groupName, processNextGroup) {

		console.log('UserModel::addToGroups::each group::enter', groupName);
		

		Group.findOneAndUpdate({
			name: groupName
		}, {
			$push: {
				members: user._id
			}
		},  function(err, group) {
			console.log('UserModel::addToGroups::findOneAndUpdate::callback::enter', groupName);

			if (err) {
				console.log('UserModel::addToGroups::findOneAndUpdate::error', groupName, err);

				return processNextGroup(err)
			}

			if (!group) {
				console.log('UserModel::addToGroups::findOneAndUpdate::error::', groupName, "Not found");

				return processNextGroup(groupName + " not found");
			}

			console.log('UserModel::addToGroups::findOneAndUpdate::sucess', group.name);

			processNextGroup();

		});

	}, function(err) {

		if (err) {
			console.log('UserModel::addToGroups::findOneAndUpdate::error', err);

			return done(err);
		}

		done();

	});

};


userSchema.plugin($passportLocalMongoose, {
	usernameLowerCase: true
});

var User = $mongoose.model('User', userSchema);

module.exports = User;
