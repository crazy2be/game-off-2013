/*
  observable hash table by mercury
  acts as a hash table using an observableArray as backing storage
  advantage vs. regular observableArray is ease / efficency of arbitrary element access
  properties of values are not observable by default, use the preprocess option or set it yourself before calling add or append
  rebuilds index when value is removed, keys are cached, should it be lazy rebuild?
  argument is a single configuration object with the properties:
    hash: optional, function to convert values into keys, ie: ( (value)-> value.id ) is the default
    preprocess: optional, called on values before storage, can be used to set properties as observable
*/

define(function () {
	var ko = require("knockout");
	return function(params) {
  if (params == null) {
    params = {};
  }
  params.hash || (params.hash = function(x) {
    return x.id;
  });
  return {
    iterate: ko.observableArray(),
    keys: [],
    map: {},
    length: 0,
    rebuildMap: function() {
      var i, value, _i, _len, _ref;
      this.map = {};
      i = 0;
      _ref = this.iterate();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        value = _ref[_i];
        this.map[this.keys[i]] = i++;
      }
      return this;
    },
    add: function(value) {
      var key;
      key = params.hash(value);
      if (params.preprocess) {
        params.preprecess(value);
      }
      this.map[key] = this.iterate().length;
      this.iterate.push(value);
      this.keys.push(key);
      this.length++;
      return this;
    },
    append: function(values) {
      var value, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        _results.push(this.add(value));
      }
      return _results;
    },
    set: function(values) {
      return this.empty().append(values);
    },
    remove: function(value) {
      this.removeKey(params.hash(value));
      return this;
    },
    removeKey: function(key) {
      this.iterate.splice(1, this.map[key]);
      this.keys.splice(1, this.map[key]);
      this.rebuildMap();
      this.length--;
      return this;
    },
    removeBy: function(test) {
      var item, _i, _len, _ref;
      _ref = this.iterate();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (test(item)) {
          this.remove(item);
        }
      }
      return this;
    },
    get: function(key) {
      return this.iterate()[this.map[key]];
    },
    getBy: function(test) {
      var item, _i, _len, _ref;
      _ref = this.iterate();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (test(item)) {
          return item;
        }
      }
      return false;
    },
    containsAll: function(keys) {
      var key, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (!this.get(key)) {
          return false;
        }
      }
      return true;
    },
    empty: function() {
      this.iterate([]);
      this.keys = [];
      this.map = {};
      this.length = 0;
      return this;
    }
  };
}
});
