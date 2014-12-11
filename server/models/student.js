'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId,

	EmergencyContact = require('./emergencyContact.js');

var studentSchema = new Schema({
	firstName: String,
	lastName: String,
	emailAddresses: [String],
	emergencyContacts: [EmergencyContact.schema],
	avatar: {
		ref: 'File',
		type: ObjectId
	},
	birthday: {
		type: Date
	},
	address: {
		street: String,
		city: String,
		state: String,
		zip: String
	},
	phone: {
		home: String,
		cell: String
	},
	ranks: [{
		ref: 'Rank',
		type: ObjectId
	}],
	modified: {
		type: Date,
		default: Date.now
	},
	signaturedata: {
		participant: String,
		guardian: String,
		data: String
	},
	message: {
		value: String,
		viewed: {
			type: Date,
			default: null
		}
	},
	registrationDate: {
		type: Date,
		default: Date.now
	},
	notes: String
});

studentSchema.pre('remove', function(preRemoveDone) {

	var _doc = this;

	var ClassModel = mongoose.model('Class');

	ClassModel.findOneAndUpdate({
		students: _doc._id
	}, {
		$pull: {
			students: _doc._id
		}
	}, preRemoveDone);

});

var Student = mongoose.model('Student', studentSchema);

module.exports = Student;