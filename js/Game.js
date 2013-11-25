define(function (require) {
	var Eventable = require("Eventable");
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

	function randID() {
		var str = "";
		for (var i = 0; i < 10; i++) {
			str += String.fromCharCode(rand(97, 122));
		}
		return str;
	}

	return function Game(db) {
		var self = this;
		Eventable(self);
		var collision = new Collision(self);
		var timer = new Timer();
		var levelManager = new Levels.Manager(self);
		var objects = [];

		var world = {
			gameState: ko.observable(""),
		};

		self.add = function(obj) {
			if (obj.id) throw "Object already added!";
			obj.id = randID();
			objects.push(obj);
			self.fire('object_added', obj);
		};

		self.remove = function(obj) {
			if (!obj.id) throw "Object never added!";
			self.fire('object_removed', obj);
			objects.splice(objects.indexOf(obj), 1);
			obj.id = '';
		};

		self.clear = function () {
			for (var i = objects.length - 1; i >= 0; i--) {
				self.remove(objects[i]);
			}
		};

		self.find = function (type) {
			var list = [];
			for (var i = 0; i < objects.length; i++) {
				if (objects[i].types && objects[i].types[type]) {
					list.push(objects[i]);
				}
			}
			return list;
		}

		self.intersecting = function (entityA, entityB) {
			return collision.intersects(entityA, entityB);
		};

		self.collide = function (obj, filter) {
			return collision.collide(obj, filter);
		}

		self.input = new Input();

		self.every = function (dur, fnc) {
			timer.every(dur, fnc);
		}
		self.after = function (dur, fnc) {
			timer.after(dur, fnc);
		}

		levelManager.on('next_level', function () {
			if(collision.objArrayDEBUG.length !== 0) {
				throw "Collisions not correctly disposed!";
			}
		});

		world.loadLevel = function (level) {
			self.clear();
			world.level = new level(self);
		}

		function nextLevel() {
			world.gameState("won");
			self.after(4000, function () {
				world.loadLevel(Levels.BasicLevel);
				world.gameState("playing");
			});
		}

		function gameover() {
			world.gameState("gameover");
			self.after(4000, function() {
				world.loadLevel(Levels.BasicLevel);
				world.gameState("playing");
			})
		}

		world.loadLevel(Levels.BasicLevel);
		world.gameState("playing");
		
		addBindings(ko.bindingHandlers);
		ko.applyBindings(world);
		
		self.tick = function(tickTime) {
			timer.tick(tickTime);
			
			function applyTick(entity) {
				entity.tick(tickTime);
			}

			if(world.gameState() === "playing") {
				for (var i = 0; i < objects.length; i++) {
					objects[i].tick(tickTime);
				}
				if (world.level.beaten()) {
					nextLevel();
				} else if (world.level.failed()) {
					gameover();
				}
			}
		};
	}
});
