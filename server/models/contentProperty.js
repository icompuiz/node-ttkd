var $mongoose = require('mongoose'),
    Schema = $mongoose.Schema;

var ContentPropertySchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    format: {
        type: String,
        default: 'plaintext'
    },
    value: {
        type: String,
        default: ''
    }
});

var ContentProperty;
module.exports = ContentProperty = $mongoose.model('ContentProperty', ContentPropertySchema);
