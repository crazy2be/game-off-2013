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
			levelID: ko.observable(0),
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

		function makeID() {
			var str = "";
			for (var i = 0; i < 10; i++) {
				str += String.fromCharCode(rand(97, 122));
			}
			return str;
		}

		//Uses types of obj to determine where to put it
		self.add = function(obj) {
			if (obj.id) throw "Object already added!";
			obj.id = makeID();
			collision.addObj(obj);
			arrayOfObj(obj).push(obj);
		}
		
		self.remove = function(obj) {
			if (!obj.id) throw "Object never added!";
			var arrayObserv = arrayOfObj(obj);
			var array = arrayObserv();

			for(var ix = array.length - 1; ix >= 0; ix--) {
				if(array[ix] === obj) {
					arrayObserv.splice(ix, 1);
				}
			}
			collision.removeObj(obj);
			obj.id = '';
		}

		world.loadLevel = function (level) {
			copyForEach(world.enemies(), self.remove);
			copyForEach(world.friendos(), self.remove);
			copyForEach(world.bullets(), self.remove);

			if(collision.objArrayDEBUG.length !== 0) {
				throw "Collisions not correctly disposed!";
			}

			world.level = new level(world, game, collision);
		}

		function nextLevel() {
			world.loadLevel(Levels.BasicLevel);
		}

		function gameover() {
			world.gameState("gameover");
			new Timer(self).after(4000, function() {
				world.loadLevel(Levels.BasicLevel);
				world.gameState("playing");
			})
		}

		world.loadLevel(Levels.BasicLevel);
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
				if (world.level.beaten()) {
					nextLevel();
				} else if (world.level.failed()) {
					gameover();
				}
			}
		};
	}
});
