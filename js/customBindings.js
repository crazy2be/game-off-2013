define(function (require) {
	return function addBindingHandlers(bindingHandlers) {
		bindingHandlers.stopBindings = {
			init: function () {
				return { controlsDescendantBindings: true };
			}
		};
		
		bindingHandlers.pos = {
			update: function(element, valueAccessor) {
				//TODO: Cache the previous set params so we don't set all the DOM attributes at once.
				var pos = valueAccessor();
				element.style.left = pos.x / 10 + '%';
				element.style.top = pos.y / 10 + '%';
			}
		};
		
		bindingHandlers.size = {
			update: function(element, valueAccessor) {
				//TODO: Cache the previous set params so we don't set all the DOM attributes at once.
				var size = valueAccessor();
				element.style.width = size.x / 10 + '%';
				element.style.height = size.y / 10 + '%';
			}
		};
		
		bindingHandlers.types = {
			init: function(element, valueAccessor) {
				var types = valueAccessor();
				for(var key in types) {
					var type = key;
					$(element).addClass(type);
				}
			}
		};
	}
});
