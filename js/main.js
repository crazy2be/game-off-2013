define(function (require) {
    var ko = require("knockout");
    var PerfChart = require("perf/PerfChart");
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

	function EnemyEntity(collision, base) {
		var self = this;
		var entity = embed(self, new Entity(collision));
		
		new Timer(self).every(1000, function() {
			console.log("test");
			entity.acc().y = rand(-0.5, 0.5);
		})
		
		self.tick = function(tickTime) {
			Timer.TickAll(self, tickTime);
			
			if(collision.intersects(base.colObj, self.colObj)) {
				base.hp(base.hp() - 1);
			}
			
			entity.tick.apply(self, arguments);
		}
	}
	
	function YouEntity(collision, input) {
		var self = this;
		var entity = embed(self, new Entity(collision));
		
		self.tick = function(tickTime) {
			var xVel = 0;
			if(input.keyboardState['A']) {
				xVel -= 300;
			}
			if(input.keyboardState['D']) {
				xVel += 300;
			}
			
			entity.vel().x = xVel;
			entity.vel().y = collision.collides(self.colObj) ? 200 : 0;
			
			entity.tick.apply(self, arguments);
		}
	}
	
	function BaseEntity(collision) {
		var self = this;
		var entity = embed(self, new Entity(collision));
	}

    return function main() {
        var world = {
            enemies: [],
            friendos: [],
            you: {}
        };

		var input = new Input();
		var collision = new Collision();

		var base = new BaseEntity(collision);
		base.pos(new Vec2(0, 200));
		base.size(new Vec2(200, 200));
		
		function MakeRemove(array, obj) {
			return function() {
				for (var ix = array.length - 1; ix >= 0; ix--) {
					if(array[ix] === obj) {
						array.splice(ix, 1);
					}
				}
			}
		}
		
		world.friendos.push(base);
		
		world.you = new YouEntity(collision, input);
		world.you.pos(new Vec2(300, 200));
		world.you.size(new Vec2(50, 50));

        for (var ix = 0; ix < 1; ix++) {
			var enemy = new EnemyEntity(collision, base);
			enemy.pos(new Vec2(~~rand(10, 510), ~~rand(0, 100)));
			enemy.size(new Vec2(10, 10));
			enemy.vel(new Vec2(0, rand(50, 80)));
            world.enemies.push(enemy);
        }

        addBindings(ko.bindingHandlers);

        ko.applyBindings(world);

        var chart = new PerfChart();
        $('.perfChart')[0].appendChild(chart.elm);

        var worldTime = new Date().getTime();
        (function GameLoop() {
            self.requestAnimationFrame(GameLoop);

            var newTime = new Date().getTime();
            var tickTime = newTime - worldTime;
            worldTime = newTime;

            chart.addDataPoint(tickTime);

			function applyTick(entity) {
				entity.tick(tickTime);
			}

            world.enemies.forEach(applyTick);
			world.friendos.forEach(applyTick);
			
			applyTick(world.you);
        })();
    }
});
