define(function (require) {
	var ko = require("knockout");
	var PerfChart = require("perf/PerfChart");
	var $ = require("jquery");
	var addBindings = require("customBindings");
	
	var Game = require("Game");

	var Firebase = require("Firebase");

	function FakeDB() {
		var self = this;
		self.child = function () { return self; };
		self.on = function () {};
		self.transaction = function (a, b) { b() };
	}

	function resize() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		var x = w > h ? (w - h) / 2 : 0;
		var y = w > h ? 0 : (h - w) / 2;
		var mwh = Math.min(w, h);

		$('#gameboard').css('width', mwh).css('height', mwh)
			.css('top', y).css('left', x);
	}
	return function main() {
		var db = new Firebase('https://r4zlxbwki99.firebaseio-demo.com/devGame');
		var hostNode = db.child('hasHost');
		hostNode.transaction(function (hasHost) {
			if (hasHost === null) {
				return true;
			} else {
				return;
			}
		}, function (error, committed, snapshot) {
			if (error) {
				console.log('Transaction failed abnormally!', error);
				return;
			}

			var isHost = committed ? true : false;
			console.log(isHost ? "We are host" : "We are not host.");
			if (isHost) {
				hostNode.onDisconnect().remove();
			}
			bootup(db, isHost);
		});
	}

	function bootup(db, isHost) {
		$(window).on('resize', resize);
		resize();

		$('#loadingScreen').fadeOut(500, 'swing', function () {$(this).remove()});

		var game = new Game(db, isHost);

		var chart = new PerfChart();
		$('.perfChart')[0].appendChild(chart.elm);

		var worldTime = new Date().getTime();
		(function GameLoop() {
			self.requestAnimationFrame(GameLoop);

			// TODO: Cap frame time...
			// TODO: Fixed timesteps
			var newTime = new Date().getTime();
			var tickTime = newTime - worldTime;
			worldTime = newTime;

			tickTime = Math.min(tickTime, 350);

			chart.addDataPoint(tickTime);

			game.tick(tickTime);
		})();
	}
});
