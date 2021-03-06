﻿define(function (require) {
	return function Vec2(x, y) {
		var self = this;

		self.x = x || 0;
		self.y = y || 0;
		
		self.clone = function() {
			return new Vec2(self.x, self.y);
		}
	}
});
