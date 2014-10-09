'use strict';

var pubUser = {
		users: [{
				username: 'public',
				access: {
						read: true,
						create: true
				}
		}]
};

var pub = {
		groups: [{
				name: 'public',
				access: {
						read: true,
						create: true
				}
		}]
};

var users = {
		groups: [{
				name: 'users',
				access: {
						read: true,
						create: true
				}
		}]
};

var admin = {
		groups: [{
				name: 'administrators',
				access: {
						read: true,
						create: true
				}
		}]
};

var all = [admin, users, pub];

var assets = [{
    name: '/api/mocks',
	items: [admin, users]
}, {
    name: '/api/fs/directories',
	items: [admin, users]

}, {
    name: '/api/fs/files',
	items: [admin, users]
}, {
    name: '/api/contentitems',
	items: [admin, users]

}, {
    name: '/api/contenttypes',
	items: [admin, users]
}, {
    name: '/api/inputformats',
	items: [admin, users]
}, {
    name: '/api/outputformats',
	items: [admin, users]

}, {
    name: '/api/templates',
	items: [admin, users]
}, {
    name: '/api/studentlists',
	items: [admin, users]
}, {
    name: '/api/achievements',
	items: [admin, users]
}, {
    name: '/api/attendance',
	items: [admin, users]
}, {
    name: '/api/classes',
	items: [admin, users]
}, {
    name: '/api/emergencycontacts',
	items: [admin, users]
}, {
    name: '/api/ranks',
	items: [admin, users]
}, {
    name: '/api/students',
	items: [admin, users]
}, {
    name: '/api/programs',
	items: [admin, users]
}, {
    name: '/api/workshops',
	items: [admin, users]
}, {
    name: '/api/workshopattendancelists',
	items: [admin, users]
}];

module.exports = {
		data: assets
};
