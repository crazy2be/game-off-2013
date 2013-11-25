define(function (require) {
	return function GamePresenter(game) {
		objects = {};
		$gameboard = document.getElementById('#gameboard');
		game.on('object_added', function (obj) {
			console.log("Presenter adding object: " + obj.id);
			var elem = $('div').class("Entity");
			objects[obj.id] = elem;
			$gameboard.append(elem);
		});
		game.on('object_removed', function (obj) {
			console.log("Presenter removing object: " + obj.id);
			objects[obj.id].remove();
		});
	};
});
