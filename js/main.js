define(function (require) {
    var ko = require("knockout");
    var PerfChart = require("perf/PerfChart");
    var $ = require("jquery");

    return function main() {
        function Vec2(x, y) {
            var self = this;

            self.x = ko.observable(x || 0);
            self.y = ko.observable(y || 0);
        }

        function Entity(x, y, width, height) {
            var self = this;

            self.pos = new Vec2(x, y);
            self.size = new Vec2(width, height);
        }

        var world = {
            enemies: [],
            friendos: [],
            you: {}
        };

        function rand(min, max) {
            return Math.random() * (max - min) + min;
        }

        for (var ix = 0; ix < 100; ix++) {
            world.enemies.push(new Entity(Math.round(rand(10, 510)), Math.round(rand(0, 100)), 10, 10));
        }

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
                enemy.pos.y(
                  Math.round(enemy.pos.y() + tickTime / 10));
            });
        })();
    }
});
