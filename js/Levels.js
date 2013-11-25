define(function (require) {
	var ko = require("knockout");
	
	var $ = require("jquery");
	var addBindings = require("customBindings");
	
	var Ents = require("Ents");
	
	var Vec2 = require("Vec2");

	var Eventable = require("Eventable");
	
	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}

	function BasicLevel(game) {
		var self = this;

		var base;
		function start() {
			base = new Ents.BaseEntity(game);
			base.pos(new Vec2(0, 90));
			base.size(new Vec2(100, 10));
			game.add(base);

			var you = new Ents.YouEntity(game);

			you.pos(new Vec2(45, 90));
			you.size(new Vec2(10, 5));

			game.add(you);

			for (var ix = 0; ix < 150; ix++) {
				var enemy = new Ents.EnemyEntity(game);
				enemy.pos(new Vec2(~~rand(0, 100), ~~rand(0, 10)));
				enemy.size(new Vec2(2, 2));
				enemy.vel(new Vec2(0, rand(4, 8)));
				game.add(enemy);
			}
		}

		self.beaten = function () {
			return game.find("EnemyEntity").length == 0;
		};

		self.failed = function () {
			return base.hp() <= 0;
		};
		start();
	}

	function LevelManager(game) {
		var self = this;
		Eventable(self);
	}
	
	return {
		BasicLevel: BasicLevel,
		Manager: LevelManager,
	}
});
