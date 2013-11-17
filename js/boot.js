requirejs.config({
	//We need paths because min files are annoying to handle with magicWrapper...
	paths: {
		//THREE: 'lib/three',
		jquery: 'lib/jquery',
		knockout: 'lib/knockout',
	},
	shim: {
		jquery: {
			deps: [],
			init: function () {
				return $;
			}
		},
	}
});

define(["main"], function (main) {
	main();
});
