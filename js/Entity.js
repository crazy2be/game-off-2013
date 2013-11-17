define(function (require) {
	var ko = require("knockout");
	var $ = require("jquery");
	var Vec2 = require("Vec2")

	return function Entity(dispose, collision) {
		var self = this;

		self.pos = ko.observable(new Vec2());
		self.vel = ko.observable(new Vec2());
		self.acc = ko.observable(new Vec2());
        self.size = ko.observable(new Vec2());
		self.hp = ko.observable(100);
		
		self.dispose = dispose;
		
		collision.addObj(self);
		
		function applyAcc(tickTime) {
			self.vel().x += self.acc().x * tickTime / 1000;
			self.vel().y += self.acc().y * tickTime / 1000;
			self.vel.valueHasMutated();
		}
		
		function applyVel(tickTime) {
			self.pos().x += self.vel().x * tickTime / 1000;
			self.pos().y += self.vel().y * tickTime / 1000;
			self.pos.valueHasMutated();
		}
		
		self.tick = function(tickTime) {
			applyAcc(tickTime);
			applyVel(tickTime);
		};
	}
});
