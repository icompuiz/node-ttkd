/**
 * Module dependencies.
 */
var $mongoose = require('mongoose'),
	Schema = $mongoose.Schema;
	
var groupSchema = new Schema({
	name: { type: String, unique: true },
	members: [{
		type: $mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}]
});

var Group = $mongoose.model('Group', groupSchema);

module.exports = Group;