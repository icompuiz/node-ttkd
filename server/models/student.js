'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId,

	EmergencyContact = require('./emergencyContact.js');

var studentSchema = new Schema({
	firstName: String,
	lastName: String,
	emailAddress: String,
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
	Ranks: [{
		ref: 'Rank',
		type: ObjectId
	}],
	modified: {
		type: Date,
		default: Date.now
	}
});

var Student = mongoose.model('Student', studentSchema);

module.exports = Student;