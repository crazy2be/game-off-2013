requirejs.config({
	//We need paths because min files are annoying to handle with magicWrapper...
	paths: {
		jquery: '../lib/jquery',
		knockout: '../lib/knockout',
		Firebase: 'https://cdn.firebase.com/v0/firebase',
	},
	shim: {
		jquery: {
			deps: [],
			init: function () {
				return $;
			},
		},
		Firebase: {
			init: function () {
				return Firebase;
			},
		},
	}
});

define(["main"], function (main) {
	main();
});
