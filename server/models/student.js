'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var studentSchema = new Schema({
	firstName: String,
	lastName: String,
	emailAddress: String,
	emergencyContacts: [{
		ref: 'EmergencyContact',
		type: ObjectId
	}],
	birthday: {
		type: Date
	},
	address: String,
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