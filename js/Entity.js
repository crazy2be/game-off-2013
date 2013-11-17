define(function (require) {
    var ko = require("knockout");
    var $ = require("jquery");
	var Vec2 = require("Vec2")

    return function Entity(collision) {
        var self = this;

        self.pos = ko.observable(new Vec2());
		self.vel = ko.observable(new Vec2());
        self.size = ko.observable(new Vec2());
		
		self.colObj = collision.addObj(self.pos(), self.vel());
		
		self.pos.subscribe(function() {
			collision.updateObj(self.colObj, self.pos(), self.size());
		});
		self.size.subscribe(function() {
			collision.updateObj(self.colObj, self.pos(), self.size());
		});
		
		function applyVel(tickTime) {
			self.pos().x += self.vel().x * tickTime / 1000;
			self.pos().y += self.vel().y * tickTime / 1000;
			self.pos.valueHasMutated();
		}
		
		self.tick = function(tickTime) {
			applyVel(tickTime);
		};
    }
});
