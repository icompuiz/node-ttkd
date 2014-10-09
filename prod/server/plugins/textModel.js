var TextModelPlugin = function(schema) {

    schema.add({
    	text: {
    		type: String,
    		default: ''
    	}
    });


};

module.exports = TextModelPlugin;