﻿define(function (require) {
	var ko = require("knockout");
	var $ = require("jquery");
	var Vec2 = require("Vec2");
	
	var embed = require("embed");
	
	var Timer = require("Timer");
	var throttle = require("throttle");

	var Entity = require("Entity");
	
	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}
	
	function EnemyEntity(game, collision, base) {
		var self = this;
		var entity = embed(self, new Entity(game, collision));
		
		new Timer(self).every(1000, function() {
			self.acc().y = rand(-0.1, 0.1);
		})
	
		self.hp.subscribe(function(newHp) {
			if(newHp <= 0) {
				game.remove(self);
			}
		});
		
		self.tick = function(tickTime) {
			Timer.TickAll(self, tickTime);
			
			if(collision.intersects(base, self)) {
				game.remove(self);
				base.hp(base.hp() - 1);
			}
			
			entity.tick.apply(self, arguments);
		}
	}
	
	function BulletEntity(game, collision, isEnemy) {
		var self = this;
		var entity = embed(self, new Entity(game, collision));
		
		self.tick = function(tickTime) {			
			entity.vel().y = isEnemy ? 100 : -100;
			
			var hitEntity = collision.collides(self, function(other){
				if(isEnemy) {
					return !other.types["EnemyEntity"] && !other.types["BaseEntity"] && !other.types["BulletEntity"];
				} else {
					return other.types["EnemyEntity"];
				}
			});
			
			if(hitEntity) {
				game.remove(self);
				hitEntity.hp(hitEntity.hp() - 60);
			}
			
			entity.tick.apply(self, arguments);
		}
	}
	
	function YouEntity(game, collision, input) {
		var self = this;
		var entity = embed(self, new Entity(game, collision));
		
		
		self.tick = function(tickTime) {
			Timer.TickAll(self, tickTime);
			
			if(input.keyboardState[' ']) {
				throttle(self, 50, function() {
					var bullet = new BulletEntity(game, collision, false);
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
	
	function BaseEntity(game, collision) {
		var self = this;
		var entity = embed(self, new Entity(game, collision));
	
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
