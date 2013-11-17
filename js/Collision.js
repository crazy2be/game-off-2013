define(function (require) {
	var Vec2 = require("Vec2");
	
	function Collision() {
		var self = this;
		
		//Hmm... will this actually work?
		var objArray = [];
		
		//We return an object
		self.addObj = function(pos, size) {
			var colObj = {pos: pos, size: size};
			objArray.push(colObj);
			return colObj;
		};
		
		self.updateObj = function(obj, pos, size) {
			obj.pos = pos;
			obj.size = size;
		};
		
		self.removeObj = function(obj) {
			for(var ix = objArray.length - 1; ix >= 0; ix--) {
				if(objArray[ix] === obj) {
					objArray.splice(ix, 1);
				}
			}
		};
		
		function intersects(obj1, obj2) {
			var pos1 = obj1.pos;
			var size1 = obj1.size;
			var pos2 = obj2.pos;
			var size2 = obj2.pos;
			
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
		
		self.collides = function(obj) {
			var size = size || new Vec2(1, 1);
			
			for(var ix = objArray.length - 1; ix >= 0; ix--) {
				var otherObj = objArray[ix];
				if(otherObj === obj) continue;
				if(intersects(otherObj, obj)) return objArray[ix];
			}
			
			return null;
		};
	}
	
	return Collision;
});
