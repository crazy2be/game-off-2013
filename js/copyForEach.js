define(function (require) {
	return function copyForEach(arr, callback) {
		var copy = [];
		for (var i = 0; i < arr.length; i++) {
			copy[i] = arr[i];
		}
		copy.forEach(callback);
	}
});
