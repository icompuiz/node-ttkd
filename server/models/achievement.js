'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var achievementSchema = new Schema({
	attendance: {
		ref: 'Attendance',
		type: ObjectId
	},
	student: {
		ref: 'Student',
		type: ObjectId
	},
	rank: { 
		ref: 'Rank',
		type: ObjectId
	}
});

var Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;