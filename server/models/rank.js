'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId;

var rankSchema = new Schema({
	program: {
		ref: 'Program',
		type: ObjectId
	},
	rankOrder: Number,
	name: String,
	intermediaryRanks: [{
		ref: 'Rank',
		type: ObjectId
	}]
});

var Rank = mongoose.model('Rank', rankSchema);

module.exports = Rank;