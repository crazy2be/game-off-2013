define(function (require) {
	var ko = require("knockout");
	var $ = require("jquery");
	var Vec2 = require("Vec2");
	
	var embed = require("embed");
	
	var throttle = require("throttle");

	var Entity = require("Entity");
	
	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}
	
	function EnemyEntity(game) {
		var self = this;
		var entity = embed(self, new Entity(game));
		var base = game.find('BaseEntity')[0];
		
		game.every(1000, function() {
			self.acc().y = rand(-0.1, 0.1);
		})
	
		self.hp.subscribe(function(newHp) {
			if(newHp <= 0) {
				game.remove(self);
			}
		});
		
		self.tick = function(tickTime) {
			if (game.intersecting(base, self)) {
				game.remove(self);
				base.hp(base.hp() - 1);
			}
			entity.tick.apply(self, arguments);
		}
	}
	
	function BulletEntity(game) {
		var self = this;
		var entity = embed(self, new Entity(game));
		entity.vel().y = 100;

		self.tick = function(tickTime) {
			var hitEntity = game.collide(self);
			if (hitEntity) {
				hitEntity.hp(hitEntity.hp() - 60);
				game.remove(self);
			}
			entity.tick.apply(self, arguments);
		}
	}
	
	function YouEntity(game) {
		var self = this;
		var entity = embed(self, new Entity(game));
		var input = game.input;
		
		self.tick = function(tickTime) {
			if(input.keyboardState[' ']) {
				throttle(game, 50, function() {
					var bullet = new BulletEntity(game);
					bullet.size(new Vec2(1, 1));
					bullet.pos(self.pos().clone());
					game.add(bullet);
				})
			}
			
			var xVel = 0;
			if(input.keyboardState['A']) {
				xVel -= 100;
			}
			if(input.keyboardState['D']) {
				xVel += 100;
			}
			
			entity.vel().x = xVel;
			
			entity.tick.apply(self, arguments);
		}
	}
	
	function BaseEntity(game) {
		var self = this;
		var entity = embed(self, new Entity(game));
	
		self.tick = function(tickTime) {
			entity.tick.apply(self, arguments);
		}
	}
	
	return {
		Entity: Entity,
		EnemyEntity: EnemyEntity,
		BulletEntity: BulletEntity,
		YouEntity: YouEntity,
		BaseEntity: BaseEntity,
	};
});
