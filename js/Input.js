define(function (require) {
	var $ = require("jquery");

	return function Input() {
		var self = this;
		
		function char(event) {
			return String.fromCharCode(event.keyCode);
		};
		
		var keyboardState = {};
		
		$('body').keydown(function(event) {
			keyboardState[char(event)] = true;
		});
		
		$('body').keyup(function(event) {
			keyboardState[char(event)] = false;
		});

		self.keyIsDown = function (key) {
			return keyboardState[key];
		}
	}
});
