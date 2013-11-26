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
						cbs.remaining = cbs.dur;
					}
				}
			}
		};
		self.every = function(dur, fnc) {
			cbs.push({dur: dur, remaining: dur, fnc: fnc});
		};
		self.after = function(dur, fnc) {
			cbs.push({dur: dur, remaining: dur, fnc: fnc, once: true});
		};
		self.throttle = function (dur, fnc) {
			var waiting = false;
			return function () {
				if (waiting) return;
				waiting = true;
				self.after(dur, function () { waiting = false });
				fnc();
			}
		};
	}
});
