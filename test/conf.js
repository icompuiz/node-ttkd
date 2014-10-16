// conf.js
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
  	'app/authenticate/loginAuthentication.js',
  	'app/programs/createProgram.js',
  	// 'app/classes/createClass.js',
  	'app/programs/removeProgram.js'
  ],
  capabilities: {
    browserName: 'chrome'
  }
}