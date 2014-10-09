var FileSystemItem = $mongoose.model('FileSystemItem');

var resource = $restful
    .model('FileSystemItem', FileSystemItem.schema)
    .methods(['get']);

function register() {
	resource.before('get', function(req, res, next) {

	});

	resource.after('get', function(req, res, next) {

	});
	return resource;
}



module.exports = {
	resource: resource,
	register: register
};