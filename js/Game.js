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

	ko.observableHash = require("../lib/observableHash");

	function rand(min, max) {
		return Math.random() * (max - min) + min;
	}

	function clean(obj, chain) {
		chain.push(obj);
		var cloned = {};
		var hasKeys = false;
		for (var k in obj) {
			hasKeys = true;
			var val = obj[k];
			if (val.subscribe) val = val();
			if (k[0] === '_') continue;
			if (typeof val === 'function') continue;
			if (chain.indexOf(val) != -1) continue;
			cloned[k] = clean(val, chain);
		}
		return hasKeys ? cloned : obj;
	}

	function pushToFirebase(db, obj) {
		Object.keys(obj).forEach(function (k) {
			if (k[0] === '_') return;
			var val = obj[k];
			var c = db.child(k);
			if (val.subscribe) {
				val.subscribe(function (newValue) {
					c.set(clean(newValue, []));
				});
			}
			pushToFirebase(c, val);
		});
	}

	function watchFirebase(db, obj) {
		Object.keys(obj).forEach(function (k) {
			if (k[0] === '_') return;
			var val = obj[k];
			var c = db.child(k);
			if (val.subscribe) {
				c.on('value', function (snapshot) {
					val(snapshot.val());
				});
			}
			watchFirebase(c, val);
		});
	}

// 	db.on('child_added', function

	return function Game(db, isHost) {
		var self = this;
		
		//Just for debugging... or maybe not...
		window.game = self;

		var collision = new Collision();

		var world = {
			enemies: ko.observableHash({}),
			friendos: ko.observableHash({}),
			bullets: ko.observableHash({}),
			gameState: ko.observable("starting"), //starting, playing, gameover
			levels: ko.observableArray([Levels.BasicLevel]),
			level: ko.observable(0)
		};

// 		if (isHost) pushToFirebase(db, world);
// 		else watchFirebase(db, world);
		
		window.world = world;

		function objLength(obj) {
			var len = 0;
			for (var k in obj) len++;
			 return len;
		}
		function arrayOfObj(obj) {
			if(obj.types["EnemyEntity"]) {
				return world.enemies;
			} if(obj.types["BulletEntity"]) {
				return world.bullets;
			} else if (objLength(obj.types) < 2) {
				throw "BaseEntity added!!! no allow.";
			} else {
				return world.friendos;
			}
		}
		function makeIDStr() {
			var str = '';
			for (var i = 0; i < 20; i++) {
				// http://www.asciitable.com/
				str += String.fromCharCode(rand(97, 122))
			}
			return str;
		}

		//Uses types of obj to determine where to put it
		self.add = function(obj) {
			if (obj.id) throw "Adding object that already exists.";
			var id = makeIDStr()
			obj.id = id;
// 			obj = obj.obj;
			var arr = arrayOfObj(obj);
			arr.add(obj); // it takes .id as key
		}
		
		self.remove = function(obj) {
			if (!obj.id) {
// 				throw ("Attempt to remove object that doesn't exist.");
				return;
			}
// 			var obj = obj.obj;
			collision.removeObj(obj);
			arrayOfObj(obj).remove(obj);
			obj.id = "";
// 			var arrayObserv = arrayOfObj(obj);
// 			var array = arrayObserv();
//
// 			for(var ix = array.length - 1; ix >= 0; ix--) {
// 				if(array[ix] === obj) {
// 					arrayObserv.splice(ix, 1);
// 				}
// 			}
		}

		function startPlaying() {
			var lastLevelDispose = null;
			
			function loadLevel() {
				var curLevel = world.levels()[world.level()];
			
				if(lastLevelDispose) {
					lastLevelDispose();
				}
				
				world.enemies.empty();
				world.friendos.empty();
				world.bullets.empty();
				
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
			if (!isHost) return;

			Timer.TickAll(self, tickTime);
			
			function applyTick(entity) {
				entity.tick(tickTime);
			}

			if(world.gameState() === "playing") {
				copyForEach(world.enemies.iterate(), applyTick);
				copyForEach(world.friendos.iterate(), applyTick);
				copyForEach(world.bullets.iterate(), applyTick);
			}
		};
	}
});
