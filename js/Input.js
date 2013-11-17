define(function (require) {
    var ko = require("knockout");
    var $ = require("jquery");

	return function Input() {
		var self = this;
		
		self.codeToChar = function(keycode) {
			return String.fromCharCode(keycode);
		};
		
		self.keyboardState = {};
		
		function MakeKeyBasedEvent(subscribeFnc) {
			return function(callback) {
				subscribeFnc(function(event){
					callback(self.codeToChar(event.keyCode));
				});
			}
		}
		
		self.keydown = MakeKeyBasedEvent($('body').keydown);
		self.keyup = MakeKeyBasedEvent($('body').keyup);
		self.keypress = MakeKeyBasedEvent($('body').keypress);
		
		$('body').keydown(function(event) {
			self.keyboardState[self.codeToChar(event.keyCode)] = true;
		});
		
		$('body').keyup(function(event) {
			self.keyboardState[self.codeToChar(event.keyCode)] = false;
		});
	}
});
