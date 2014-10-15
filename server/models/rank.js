'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.Schema.Types.ObjectId,
	Rank = require('./rank.js');

var rankSchema = new Schema({
	program: {
		ref: 'Program',
		type: ObjectId
	},
	rankOrder: Number,
	name: String,
	intermediaryRanks: [
			new Schema({
				id: String,
				name: String,
				rankOrder: Number
			})
		], 
	color: String
});

var Rank = mongoose.model('Rank', rankSchema);

module.exports = Rank;