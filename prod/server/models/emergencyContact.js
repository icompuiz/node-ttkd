'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var emergencyContactSchema = new Schema({
	name: String,
	email: String,
	phoneNumber: String,
	relationship: String
});

var EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

module.exports = EmergencyContact;