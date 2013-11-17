define(function (require) {
	return function copyForEach(array, callback) {
		var arrayCopy = [];
		array.forEach(function(elem){
			arrayCopy.push(elem);
		});
		arrayCopy.forEach(callback);
	}
});
