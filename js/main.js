define(function (require) {
//     var ko = require("knockout");
//     var PerfChart = require("perf/PerfChart");
//     var $ = require("jquery");
    var addBindings = require("customBindings");

    return function main() {
      function observable(obj) {
        obj.__cbs = {};
        obj.on = function (evt, cb) {
          (obj.__cbs[evt] = obj.__cbs[evt] || []).push(cb);};
        obj.fire = function (evt/* args ... */) {
          var args = Array.prototype.slice.call(arguments, 1);
          (obj.__cbs[evt] || []).forEach(function (cb) {
            cb.apply(obj, args);})};};
      function Vec2(x, y) {
        observable(this);
        Object.defineProperty(this, "x", {
          get: function () { return this._x },
          set: function (x) {
            this._x = x;
            this.fire("changed", x);}});
        Object.defineProperty(this, "y", {
          get: function () { return this._y },
          set: function (y) {
            this._y = y;
            this.fire("changed", y);}});
        this.x = +(x || 0);
        this.y = +(y || 0);
      }
      function Entity(x, y, w, h) {
        var self = this;
        observable(self);
        self.pos = new Vec2(x, y);
        self.pos.on("changed", function(val) {
          self.fire("moved", self.pos);});}
      function EntityPresenter(entity) {
        var self = this;
        var elem = document.createElement('div');
        elem.className = 'entity';
        entity.on("moved", function (pos) {
          elem.style.top = pos.y + 'px';
          elem.style.left = pos.x + 'px';});
        document.body.appendChild(elem);}
      var entities = [];
      for (var i = 0; i < 100; i++) {
        var entity = new Entity(Math.random()*400, Math.random()*400, Math.random()*400, Math.random()*400);
        new EntityPresenter(entity);
        entities.push(entity);}
      function gameLoop() {
        for (var i = 0; i < 100; i++) {
          entities[i].pos.y += 1;}
        requestAnimationFrame(gameLoop);}
      gameLoop();
    };
    return function main() {
        function Vec2(x, y) {
            var self = this;

            self.x = x || 0;
           	self.y = y || 0;
        }

        function Entity(x, y, width, height) {
            var self = this;

            self.pos = ko.observable(new Vec2(x, y));
            self.size = ko.observable(new Vec2(width, height));
        }

        var world = {
            enemies: [],
            friendos: [],
            you: {}
        };

        function rand(min, max) {
            return Math.random() * (max - min) + min;
        }

        for (var ix = 0; ix < 2000; ix++) {
            world.enemies.push(new Entity(~~rand(10, 510), ~~rand(0, 100), 10, 10));
        }

        addBindings(ko.bindingHandlers);

        ko.applyBindings(world);		

        var chart = new PerfChart();
        $('.perfChart')[0].appendChild(chart.elm);

        var worldTime = new Date().getTime();
        (function GameLoop() {
            self.requestAnimationFrame(GameLoop);

            var newTime = new Date().getTime();
            var tickTime = newTime - worldTime;
            worldTime = newTime;

            chart.addDataPoint(tickTime);

            world.enemies.forEach(function (enemy) {
                enemy.pos().y += ~~(tickTime / 10);
                enemy.pos.valueHasMutated();
            });
        })();
    }
});
