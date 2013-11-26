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

		var base = new Ents.BaseEntity(game);
		self.start = function () {
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
	}

	function LevelManager(game) {
		var self = this;
		Eventable(self);
		var m_list = [
			BasicLevel,
			// TODO: Add more levels :)
		];
		var m_level;
		var m_number;

		self.load = function (number) {
			if (number < 0 || number > m_list.length) {
				throw "Unknown level " + number;
			}
			game.clear();
			m_number = number;
			m_level = new m_list[number](game);
			m_level.start();
			self.fire('level_loaded', number);
		};
		self.count = function () {
			return m_list.length;
		};
		self.start = function () {
			self.load(0);
		};
		self.tick = function () {
			if (m_level.beaten()) {
				self.fire('level_won', m_number);
			} else if (m_level.failed()) {
				self.fire('level_failed', m_number);
			}
		};
	}
	
	return {
		Manager: LevelManager,
	}
});
