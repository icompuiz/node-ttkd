var $mongoose = require('mongoose'),
	Schema = $mongoose.Schema
	$extend = require('mongoose-schema-extend');

var AccessControlEntry = require('./accessControlEntry');

var GroupAccessControlEntrySchema = AccessControlEntry.schema.extend({
	group: {
		ref: 'Group',
		type: $mongoose.Schema.Types.ObjectId
	}
});

var GroupAccessControlEntry = $mongoose.model('GroupAccessControlEntry', GroupAccessControlEntrySchema);
module.exports = GroupAccessControlEntry;

