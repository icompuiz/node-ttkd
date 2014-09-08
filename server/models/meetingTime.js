'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var meetingTimeSchema = new Schema({
	startDate: Date,
	endDate: Date
});

var MeetingTime = mongoose.model('MeetingTime', meetingTimeSchema);

module.exports = MeetingTime;