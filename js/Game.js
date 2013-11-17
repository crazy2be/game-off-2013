﻿define(function (require) {
	var ko = require("knockout");
	
    var $ = require("jquery");
    var addBindings = require("customBindings");
	
	var Input = require("Input");
	var Collision = require("Collision");
	var Timer = require("Timer");
	
	var Entity = require("Entity");
	
	var embed = require("embed");
	
	var Vec2 = require("Vec2");

	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}
	
	function EnemyEntity(dispose, collision, base) {
		var self = this;
		var entity = embed(self, new Entity(dispose, collision));
		
		new Timer(self).every(1000, function() {
			entity.acc().y = rand(-0.5, 0.5);
		})
		
		self.tick = function(tickTime) {
			Timer.TickAll(self, tickTime);
			
			if(collision.intersects(base, self)) {
				base.hp(base.hp() - 1);
				dispose(self);
			}
			
			entity.tick.apply(self, arguments);
		}
	}
	
	function YouEntity(dispose, collision, input) {
		var self = this;
		var entity = embed(self, new Entity(dispose, collision));
		
		self.tick = function(tickTime) {
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
	
	function BaseEntity(dispose, collision) {
		var self = this;
		var entity = embed(self, new Entity(dispose, collision));
	
		self.tick = function(tickTime) {
			entity.tick.apply(self, arguments);
		}
	}
	
	return function Game(world) {
		var self = this;

		var input = new Input();
		var collision = new Collision();

		function MakeRemove(arrayObserv) {
			var array = arrayObserv();
			return function(obj) {
				for (var ix = array.length - 1; ix >= 0; ix--) {
					if(array[ix] === obj) {
						arrayObserv.splice(ix, 1);
						collision.removeObj(obj);
					}
				}
			}
		}

        var world = {
            enemies: ko.observableArray(),
            friendos: ko.observableArray(),
			bullets: ko.observableArray(),
            you: new YouEntity(null, collision, input),
			gameState: ko.observable("starting") //starting, playing, gameover
        };

		world.gameState.subscribe(function(gameState) {
			if(gameState === "playing") {
				startPlaying();
			}
		})

		function startPlaying() {
			world.enemies([]);
			world.friendos([]);
			
			var base = new BaseEntity(MakeRemove(world.friendos), collision);
			base.pos(new Vec2(0, 200));
			base.size(new Vec2(600, 200));
		
			world.friendos.push(base);
		
			//Dispose won't work yet..
			world.you.pos(new Vec2(300, 200));
			world.you.size(new Vec2(50, 50));

	        for (var ix = 0; ix < 300; ix++) {
				var enemy = new EnemyEntity(MakeRemove(world.enemies), collision, base);
				enemy.pos(new Vec2(~~rand(10, 510), ~~rand(0, 100)));
				enemy.size(new Vec2(10, 10));
				enemy.vel(new Vec2(0, rand(50, 80)));
	            world.enemies.push(enemy);
	        }
		
			base.hp.subscribe(function(newValue) {
				if(newValue < 0 && world.gameState() !== "gameover") {
					world.gameState("gameover");
					new Timer(self).after(5000, function() {
						world.gameState("playing");
					})
				}
			})
		}
		
		world.gameState("playing");
		
        addBindings(ko.bindingHandlers);
        ko.applyBindings(world);
		
		self.tick = function(tickTime) {
			Timer.TickAll(self, tickTime);
			
			function applyTick(entity) {
				entity.tick(tickTime);
			}

            world.enemies().forEach(applyTick);
			world.friendos().forEach(applyTick);
			
			applyTick(world.you);
		};
	}

	return function main() {

	}
});
