define(function (require) {
	return function embed(dest, source) {
		for(var key in source) {
			dest[key] = source[key];
		}

		return source;
	}
});
