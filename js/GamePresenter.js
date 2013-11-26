define(function (require) {
	return function GamePresenter(game) {
		objects = {};
		elems = {};
		gameboard = document.getElementById('gameboard');
		game.on('object_added', function (obj) {
			console.log("Presenter adding object: " + obj.id);
			objects[obj.id] = obj;
			var elem = document.createElement('div');
			elem.className = "Entity";
			for (var type in obj.types) {
				elem.className += " " + type;
			}
			var hp = document.createElement('div');
			hp.className = 'healthBar';
			elem.appendChild(hp);

			obj.pos.subscribe(function () {
				elem.style.left = obj.pos().x + '%';
				elem.style.top = obj.pos().y + '%';
			});
			obj.size.subscribe(function () {
				elem.style.width = obj.size().x + '%';
				elem.style.height = obj.size().y + '%';
			});
			obj.hp.subscribe(function () {
				hp.style.width = obj.hp() + '%';
			});
			elems[obj.id] = elem;
			gameboard.appendChild(elem);
		});
		game.on('object_removed', function (obj) {
			console.log("Presenter removing object: " + obj.id);
			elems[obj.id].parentNode.removeChild(elems[obj.id]);
		});
	};
});
