define(function (require) {	
	var Timer = require("Timer");
	//Adds a timer to the host (so you must call Timer.TickAll)
	return function throttle(host, freq, action) {
		host.throttledFncs = host.throttledFncs || [];
		
		if(typeof host.throttledFncs[action] === "undefined") {
			host.throttledFncs[action] = { freq: freq, waiting: false, fnc: action };
		}
		
		var data = host.throttledFncs[action];
		data.freq = freq; //Allows them to update freq
		
		if(!data.waiting) {
			data.waiting = true;
			new Timer(host).after(data.freq, function() {
				data.waiting = false;
			});
			action();
		}
	}
});
