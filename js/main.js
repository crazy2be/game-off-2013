define(function (require) {
	var ko = require("knockout");
	var PerfChart = require("perf/PerfChart");
	var $ = require("jquery");
	var addBindings = require("customBindings");
	
	var Game = require("Game");

	return function main() {
		var game = new Game();

		var chart = new PerfChart();
		$('.perfChart')[0].appendChild(chart.elm);

		var worldTime = new Date().getTime();
		(function GameLoop() {
			self.requestAnimationFrame(GameLoop);

			//TODO: Cap frame time...
			var newTime = new Date().getTime();
			var tickTime = newTime - worldTime;
			worldTime = newTime;

			chart.addDataPoint(tickTime);

			game.tick(tickTime);
		})();
	}
});
