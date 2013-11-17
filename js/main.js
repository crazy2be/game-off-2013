define(function (require) {
    var ko = require("knockout");
    var PerfChart = require("perf/PerfChart");
    var $ = require("jquery");
    var addBindings = require("customBindings");
	var Input = require("Input");
	
	var Entity = require("Entity");
	
	var embed = require("embed");
	
	var Vec2 = require("Vec2");

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

	function EnemyEntity() {
		var self = this;
		var entity = embed(self, new Entity());
		
		self.tick = function(tickTime) {
			entity.tick.apply(self, arguments);
			
			entity.vel().y = rand(2, 12) / 1;
		}
	}
	
	function YouEntity(input) {
		var self = this;
		var entity = embed(self, new Entity());
		
		self.tick = function(tickTime) {
			var xVel = 0;
			if(input.keyboardState['A']) {
				xVel -= 300;
			}
			if(input.keyboardState['D']) {
				xVel += 300;
			}
			
			entity.vel().x = xVel;
			
			entity.tick.apply(self, arguments);
		}
	}

    return function main() {
        var world = {
            enemies: [],
            friendos: [],
            you: {}
        };

		var input = new Input();

        for (var ix = 0; ix < 300; ix++) {
			var enemy = new EnemyEntity();
			enemy.pos(new Vec2(~~rand(10, 510), ~~rand(0, 100)));
			enemy.size(new Vec2(10, 10));
			enemy.vel(new Vec2(0, rand(0.5, 0.8)));
            world.enemies.push(enemy);
        }
		
		world.you = new YouEntity(input);
		world.you.pos(new Vec2(300, 500));
		world.you.size(new Vec2(50, 50));

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
