define(function (require) {
	var Vec2 = require("Vec2");
	
	function Collision(game) {
		var self = this;
		
		var collideables = [];
		self.objArrayDEBUG = collideables;
		
		game.on('object_added', function (obj) {
			console.log("[collision system] adding ", obj.id);
			collideables.push(obj);
		});
		
		game.on('object_removed', function(obj) {
			console.log("[collision system] removing ", obj.id);
			for(var ix = collideables.length - 1; ix >= 0; ix--) {
				if(collideables[ix] === obj) {
					collideables.splice(ix, 1);
					return;
				}
			}
			throw "Could not remove obj";
		});
		
		self.intersects = function(obj1, obj2) {
			var pos1 = obj1.pos();
			var size1 = obj1.size();
			var pos2 = obj2.pos();
			var size2 = obj2.size();
			
			var x1End = pos1.x + size1.x;
			var y1End = pos1.y + size1.y;
			var x2End = pos2.x + size2.x;
			var y2End = pos2.y + size2.y;
			
			if(pos1.x > x2End) return false;
			if(pos2.x > x1End) return false;
			if(pos1.y > y2End) return false;
			if(pos2.y > y1End) return false;
			
			return true;
		}

		self.collide = function(obj, filter) {
			filter = filter || function (other) { return false; };
			for (var i = 0; i < collideables.length; i++) {
				var other = collideables[i];
				if (obj == other || filter(other)) continue;
				if (self.intersects(obj, other)) return other;
			}
			return null;
		};
	}
	
	return Collision;
});
