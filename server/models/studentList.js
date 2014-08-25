'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var studentListSchema = new Schema({
	students: [{
		ref: 'Student',
		type: Schema.Types.ObjectId
	}]
});

var StudentList = mongoose.model('StudentList', studentListSchema);
module.exports = StudentList;