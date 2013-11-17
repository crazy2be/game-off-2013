define(function (require) {
	var ko = require("knockout");
	
	var $ = require("jquery");
	var addBindings = require("customBindings");
	
	var Input = require("Input");
	var Collision = require("Collision");
	var Timer = require("Timer");
	var throttle = require("throttle");
	
	var Ents = require("Ents");
	
	var Vec2 = require("Vec2");
	
	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}
	
	function BasicLevel(world, game, collision, nextLevelCallback, gameOverCallback) {
		var base = new Ents.BaseEntity(game, collision);
		base.pos(new Vec2(0, 90));
		base.size(new Vec2(100, 10));
		world.friendos.push(base);
	
		var input = new Input();
		var you = new Ents.YouEntity(game, collision, input);
	
		you.pos(new Vec2(45, 90));
		you.size(new Vec2(10, 5));
		
		world.friendos.push(you);

		for (var ix = 0; ix < 150; ix++) {
			var enemy = new Ents.EnemyEntity(game, collision, base);
			enemy.pos(new Vec2(~~rand(0, 100), ~~rand(0, 10)));
			enemy.size(new Vec2(2, 2));
			enemy.vel(new Vec2(0, rand(4, 8)));
			world.enemies.push(enemy);
		}
		
		var enemSub = world.enemies.subscribe(function(enemies){
			if(enemies.length === 0) {
				nextLevelCallback();
			}
		});
	
		var hpSub = base.hp.subscribe(function(newValue) {
			if(newValue <= 0) {
				gameOverCallback();
			}
		})
		
		return function dispose() {
			enemSub.dispose();
			hpSub.dispose();
		}
	}
	
	return {
		BasicLevel: BasicLevel
	}
});
