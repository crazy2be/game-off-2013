﻿define(function (require) {
	var ko = require("knockout");
	
	var $ = require("jquery");
	var addBindings = require("customBindings");
	
	var Input = require("Input");
	var Collision = require("Collision");
	var Timer = require("Timer");
	var throttle = require("throttle");
	
	var Entity = require("Entity");
	
	var embed = require("embed");
	
	var Vec2 = require("Vec2");
	
	var makeDoOnce = require("makeDoOnce");

	function ReverseForEach(array, callback) {
		for(var ix = array.length - 1; ix >= 0; ix--) {
			callback(array[ix]);
		}
	}

	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}
	
	function EnemyEntity(game, collision, base) {
		var self = this;
		var entity = embed(self, new Entity(game, collision));
		
		new Timer(self).every(1000, function() {
			entity.acc().y = rand(-0.5, 0.5);
		})
		
		self.tick = function(tickTime) {
			Timer.TickAll(self, tickTime);
			
			if(collision.intersects(base, self)) {
				base.hp(base.hp() - 1);
				game.remove(self);
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
				hitEntity.hp(hitEntity.hp() - 60);
				game.remove(self);
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
					bullet.size(new Vec2(10, 10));
					bullet.pos(self.pos().clone());
					game.add(bullet);
				})
			}
			
			var xVel = 0;
			if(input.keyboardState['A']) {
				xVel -= 300;
			}
			if(input.keyboardState['D']) {
				xVel += 300;
			}
			
			entity.vel().x = xVel;
			var hitByEnemy = collision.collides(self, function(other){
				return other.types["EnemyEntity"];
			});
			entity.vel().y = hitByEnemy ? 200 : 0;
			
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
	
	return function Game(world) {
		var self = this;
		
		//Just for debugging... or maybe not...
		window.game = self;

		var input = new Input();
		var collision = new Collision();

		function StartLevel(world, nextLevelCallback, gameOverCallback) {
			var base = new BaseEntity(self, collision);
			base.pos(new Vec2(0, 500));
			base.size(new Vec2(600, 200));
		
			world.friendos.push(base);
		
			world.you.pos(new Vec2(300, 450));
			world.you.size(new Vec2(50, 50));

			for (var ix = 0; ix < 101; ix++) {
				var enemy = new EnemyEntity(self, collision, base);
				enemy.pos(new Vec2(~~rand(10, 510), ~~rand(0, 100)));
				enemy.size(new Vec2(10, 10));
				enemy.vel(new Vec2(0, rand(50, 80)));
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

		var world = {
			enemies: ko.observableArray(),
			friendos: ko.observableArray(),
			bullets: ko.observableArray(),
			you: new YouEntity(self, collision, input),
			gameState: ko.observable("starting"), //starting, playing, gameover
			levels: ko.observableArray([StartLevel]),
			level: ko.observable(0)
		};
		
		window.world = world;

		function arrayOfObj(obj) {
			if(obj.types["EnemyEntity"]) {
				return world.enemies;
			} if(obj.types["BulletEntity"]) {
				return world.bullets;
			} else if(obj.types["YouEntity"]) {
				throw "Eh, maybe don't remove yourself...";
			} else {
				return world.friendos;
			}
		}

		//Uses types of obj to determine where to put it
		self.add = function(obj) {
			obj = obj.obj;
			arrayOfObj(obj).push(obj);
		}
		
		self.remove = function(obj) {
			var obj = obj.obj;
			var arrayObserv = arrayOfObj(obj);
			var array = arrayObserv();
			
			collision.removeObj(obj.base);
			for(var ix = array.length - 1; ix >= 0; ix--) {
				if(array[ix] === obj) {
					arrayObserv.splice(ix, 1);
				}
			}
		}

		function startPlaying() {
			var lastLevelDispose = null;
			
			function loadLevel() {
				var curLevel = world.levels()[world.level()];
			
				if(lastLevelDispose) {
					lastLevelDispose();
				}
				
				ReverseForEach(world.enemies(), self.remove);
				ReverseForEach(world.friendos(), self.remove);
				ReverseForEach(world.bullets(), self.remove);
				
				//1 for YouEntity
				if(collision.objArrayDEBUG.length !== 1) {
					throw "Collisions not correctly disposed!";
				}
			
				lastLevelDispose = curLevel(world, makeDoOnce(nextLevel), makeDoOnce(gameOver));
			}
			
			//Could just watch the level... but then there is a chance they will change it multiple times...
			function nextLevel() {
				world.level(world.level() + 1);
				if(world.level() >= world.levels().length) {
					world.level(0);
				}
				
				loadLevel();
			}
			
			function gameOver() {
				world.gameState("gameover");
				
				new Timer(self).after(4000, function() {
					world.level(0);
				
					loadLevel();
					
					world.gameState("playing");
				})
			}
			
			loadLevel();
		}
		
		startPlaying();
		world.gameState("playing");
		
		addBindings(ko.bindingHandlers);
		ko.applyBindings(world);
		
		self.tick = function(tickTime) {
			Timer.TickAll(self, tickTime);
			
			function applyTick(entity) {
				entity.tick(tickTime);
			}

			if(world.gameState() === "playing") {
				ReverseForEach(world.enemies(), applyTick);
				ReverseForEach(world.friendos(), applyTick);
				ReverseForEach(world.bullets(), applyTick);
			
				applyTick(world.you);
			}
		};
	}
});
