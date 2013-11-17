define(function (require) {	
	
	function Timer(host) {
		var self = this;
		
		host.timerFncs = host.timerFncs || [];
		
		self.every = function(duration, fnc) {
			host.timerFncs.push({duration: duration, timeLeft: duration, fnc: fnc});
		};
		
		self.after = function(duration, fnc) {
			host.timerFncs.push({duration: duration, timeLeft: duration, fnc: fnc, removeOnDone: true});
		};
	}
	
	Timer.TickAll = function(host, tickTime) {
		if(!host.timerFncs) return;
		
		for(var ix = host.timerFncs.length - 1; ix >= 0; ix--) {
			var timerData = host.timerFncs[ix];
			
			timerData.timeLeft -= tickTime;
			if(timerData.timeLeft < 0) {
				timerData.fnc();
				timerData.timeLeft = timerData.duration;
				
				if(timerData.removeOnDone) {
					host.timerFncs.splice(ix, 1);
				}
			}
		}
	};
	
	return Timer;
});
