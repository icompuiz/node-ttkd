var $mongoose = require('mongoose'),
	Schema = $mongoose.Schema,
	$accessControlListPlugin = require('../plugins/accessControlListsModel.js');
	
var mockSchema = new Schema({
	field: String
});

mockSchema.plugin($accessControlListPlugin);
var Mock = $mongoose.model('Mock', mockSchema);

module.exports = Mock;