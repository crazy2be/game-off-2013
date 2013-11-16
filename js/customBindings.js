define(function (require) {
    return function addBindingHandlers(bindingHandlers) {
        bindingHandlers.stopBindings = {
            init: function () {
                return { controlsDescendantBindings: true };
            }
        };
    }
});
