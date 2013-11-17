define(function (require) {
	function addType(entity, obj) {
		entity.types = entity.types || {};
		entity.types[obj.constructor.name] = true;
	}
	
	return function embed(dest, source) {
		
		addType(dest, dest);
		addType(dest, source);
		addType(source, dest);
		addType(source, source);
		
		for(var key in source) {
			dest[key] = source[key];
		}

		return source;
	}
});
