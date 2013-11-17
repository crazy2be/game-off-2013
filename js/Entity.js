define(function (require) {
	var ko = require("knockout");
	var $ = require("jquery");
	var Vec2 = require("Vec2");
	
	function Entity(game, collision) {
		var self = this;

		self.pos = ko.observable(new Vec2());
		self.vel = ko.observable(new Vec2());
		self.acc = ko.observable(new Vec2());
        self.size = ko.observable(new Vec2());
		self.hp = ko.observable(100);
		
		collision.addObj(self);
		
		self.hp.subscribe(function(newHp) {
			if(newHp <= 0) {
				game.remove(self);
			}
		});
		
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
	
	return Entity;
});
