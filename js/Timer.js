define(function (require) {	
	
	function Timer(host) {
		var self = this;
		
		host.timerFncs = host.timerFncs || [];
		
		self.every = function(duration, fnc) {
			host.timerFncs.push({duration: duration, timeLeft: duration, fnc: fnc});
		};
	}
	
	Timer.TickAll = function(host, tickTime) {
		host.timerFncs.forEach(function(timerData) {
			timerData.timeLeft -= tickTime;
			if(timerData.timeLeft < 0) {
				timerData.fnc();
				timerData.timeLeft = timerData.duration;
			}
		});
	};
	
	return Timer;
});
