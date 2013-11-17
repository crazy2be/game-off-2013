define(function (require) {
	var ko = require("knockout");
	var $ = require("jquery");

	return function makeDoOnce(callback) {
		var done = false;
		return function() {
			if(done) return;
			done = true;
			callback();
		}
	}
});
