define(function (require) {
	var Eventable = require("Eventable");
	var ko = require("knockout");
	
	var $ = require("jquery");
	
	var Input = require("Input");
	var Collision = require("Collision");
	var Timer = require("Timer");
	
	var Levels = require("Levels");

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


		var world = {};

		world.gameState = ko.observable("");

		levelManager.on('level_won', function (number) {
			world.gameState("won");
			self.after(4000, function () {
				levelManager.load((number + 1) % levelManager.count());
				world.gameState("playing");
			});
		});

		levelManager.on('level_lost', function (number) {
			world.gameState("gameover");
			self.after(4000, function() {
				levelManager.load(number);
				world.gameState("playing");
			})
		});

		self.start = function () {
			levelManager.start();
			world.gameState("playing");

			ko.applyBindings(world);
		};

		self.tick = function(tickTime) {
			timer.tick(tickTime);

			if (world.gameState() !== "playing") return;

			levelManager.tick(tickTime);
			for (var i = 0; i < objects.length; i++) {
				objects[i].tick(tickTime);
			}
		};
	}
});
