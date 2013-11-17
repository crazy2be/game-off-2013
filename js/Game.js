define(function (require) {
	var ko = require("knockout");
	
	var $ = require("jquery");
	var addBindings = require("customBindings");
	
	var Input = require("Input");
	var Collision = require("Collision");
	var Timer = require("Timer");
	var throttle = require("throttle");
	
	var embed = require("embed");
	
	var Vec2 = require("Vec2");
	
	var makeDoOnce = require("makeDoOnce");
	
	var copyForEach = require("copyForEach");
	
	var Levels = require("Levels");
	
	var Ents = require("Ents");

	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}

	return function Game(db) {
		var self = this;
		
		//Just for debugging... or maybe not...
		window.game = self;

		var collision = new Collision();

		var world = {
			enemies: ko.observableArray(),
			friendos: ko.observableArray(),
			bullets: ko.observableArray(),
			gameState: ko.observable("starting"), //starting, playing, gameover
			levels: ko.observableArray([Levels.BasicLevel]),
			level: ko.observable(0)
		};
		
		window.world = world;

		function arrayOfObj(obj) {
			if(obj.types["EnemyEntity"]) {
				return world.enemies;
			} if(obj.types["BulletEntity"]) {
				return world.bullets;
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
				
				copyForEach(world.enemies(), self.remove);
				copyForEach(world.friendos(), self.remove);
				copyForEach(world.bullets(), self.remove);
				
				//1 for YouEntity
				if(collision.objArrayDEBUG.length !== 0) {
					throw "Collisions not correctly disposed!";
				}
			
				lastLevelDispose = curLevel(world, self, collision, makeDoOnce(nextLevel), makeDoOnce(gameOver));
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
				copyForEach(world.enemies(), applyTick);
				copyForEach(world.friendos(), applyTick);
				copyForEach(world.bullets(), applyTick);
			}
		};
	}
});
