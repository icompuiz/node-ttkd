var $mongoose = require('mongoose'),
	Schema = $mongoose.Schema,
	$accessControlListPlugin = require('../plugins/accessControlListsModel.js');

var ModelSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	modified: {
		type: Date,
		default: Date.now
	}
});

ModelSchema.pre('save', function(done) {
	this.modified = Date.now();
	done();
});

ModelSchema.plugin($accessControlListPlugin);
var Model = $mongoose.model('Model', ModelSchema);
module.exports = Model;
