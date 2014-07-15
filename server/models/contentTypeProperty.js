var $mongoose = require('mongoose'),
    Schema = $mongoose.Schema;

var ContentTypePropertySchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    format: {
        type: String,
        default: 'plaintext'
    }
});

var ContentTypeProperty;
module.exports = ContentTypeProperty = $mongoose.model('ContentTypeProperty', ContentTypePropertySchema);
