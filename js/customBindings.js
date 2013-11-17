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
				element.style.left = pos.x + '%';
				element.style.top = pos.y + '%';
			}
		};
		
		bindingHandlers.size = {
			update: function(element, valueAccessor) {
				//TODO: Cache the previous set params so we don't set all the DOM attributes at once.
				var size = valueAccessor();
				element.style.width = size.x + '%';
				element.style.height = size.y + '%';
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
