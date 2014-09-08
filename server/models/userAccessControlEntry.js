'use strict';

var $mongoose = require('mongoose');

var AccessControlEntry = require('./accessControlEntry.js');

var UserAccessControlEntrySchema = AccessControlEntry.schema.extend({
	user: {
		ref: 'User',
		type: $mongoose.Schema.Types.ObjectId
	}
});

var UserAccessControlEntry = $mongoose.model('UserAccessControlEntry', UserAccessControlEntrySchema);

module.exports = UserAccessControlEntry;

