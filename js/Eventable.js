define(function (require) {
	return function Eventable(obj) {
		if (obj.on || obj.one || obj.off || obj.fire) {
			console.log("Warning: Eventable ignoring object rather than overwriting",
									"existing properties.",
									"Perhaps you accidentally called it twice on the same obj?");
			return;
		}
		var handlers = {};
		obj.on = function (ev, cb) {
			(handlers[ev] = handlers[ev] || []).push(cb);
		};
		obj.one = function (ev, cb) {
			obj.on(ev, function () {
				cb.apply(this, arguments);
				obj.off(cb);
			});
		};
		obj.off = function (ev, cb) {
			if (!handlers[ev]) return;
			var i = handlers[ev].indexOf(cb);
			if (i < 0) return;
			handlers[ev].splice(i, 1);
		};
		obj.fire = function (ev/*, args...*/) {
			var list = handlers[ev] || [];
			var args = [].splice.call(arguments, 1, 1);
			for (var i = 0; i < list.length; i++) {
				list[i].apply(obj, args);
			}
		};
	};
});
