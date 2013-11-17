define(function (require) {
	var ko = require("knockout");
	var PerfChart = require("perf/PerfChart");
	var $ = require("jquery");
	var addBindings = require("customBindings");
	
	var Game = require("Game");

	return function main() {
		var world = {
			enemies: ko.observableArray(),
			friendos: ko.observableArray(),
			bullets: ko.observableArray(),
			you: {},
			gameState: "playing" //playing, gameover
		};
		
		var game = new Game(world);
		
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

			world.enemies().forEach(applyTick);
			world.friendos().forEach(applyTick);
			world.bullets().forEach(applyTick);
			
			applyTick(world.you);
			
			applyTick(game);
		})();
	}
});
