define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var GridLayout    = require('famous/views/GridLayout');

    var sceneGrid = new GridLayout();

    function SceneGrid(dimensions) {
        View.apply(this, arguments);

        return _createGrid(dimensions);
    }

    SceneGrid.prototype = Object.create(View.prototype);
    SceneGrid.prototype.constructor = SceneGrid;

    SceneGrid.DEFAULT_OPTIONS = {};

    function _createGrid(dimensions) {
        var grid = new GridLayout({
                dimensions: dimensions
            });

        var surfaces = [];
        grid.sequenceFrom(surfaces);

        for(var i = 0; i < 48; i++) {
            surfaces.push(new Surface({
              content: 'hi' + (i + 1),
              size: [undefined, undefined],
              properties: {
                backgroundColor: "hsl(" + (i * 360 / 8) + ", 100%, 50%)",
                backgroundBlendMode: "multiply",
                color: "#404040",
                textAlign: 'center'
              }
            }));
        }

        return grid;
    }

    module.exports = SceneGrid;
});
