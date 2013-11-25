define(function (require) {	
	return function Timer(host) {
		var self = this;
		var cbs = [];
		self.tick = function (amount) {
			for (var i = cbs.length - 1; i >= 0; i--) {
				cbs[i].remaining -= amount;
				if (cbs[i].remaining < 0) {
					cbs[i].fnc();
					if (cbs[i].once) {
						cbs.splice(i, 1);
					} else {
						cbs.remaining = cbs.duration;
					}
				}
			}
		};
		self.every = function(duration, fnc) {
			cbs.push({duration: duration, timeLeft: duration, fnc: fnc});
		};
		self.after = function(duration, fnc) {
			cbs.push({duration: duration, timeLeft: duration, fnc: fnc, removeOnDone: true});
		};
	}
});
