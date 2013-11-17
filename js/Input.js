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
		
		self.keydown = function(callback){
			$('body').keydown(function(event){
				callback(self.codeToChar(event.keyCode));
			});
		}
		self.keyup = function(callback){
			$('body').keyup(function(event){
				callback(self.codeToChar(event.keyCode));
			});
		}
		self.keypress = function(callback){
			$('body').keypress(function(event){
				callback(self.codeToChar(event.keyCode));
			});
		}
		
		$('body').keydown(function(event) {
			self.keyboardState[self.codeToChar(event.keyCode)] = true;
		});
		
		$('body').keyup(function(event) {
			self.keyboardState[self.codeToChar(event.keyCode)] = false;
		});
	}
});
