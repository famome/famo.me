define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var GridLayout    = require('famous/views/GridLayout');

    var sceneGrid = new GridLayout();

    function SceneGrid() {
        View.apply(this, arguments);

        _createGrid();
    }

    SceneGrid.prototype = Object.create(View.prototype);
    SceneGrid.prototype.constructor = SceneGrid;

    SceneGrid.DEFAULT_OPTIONS = {};

    function _createGrid() {
        
    }

    module.exports = SceneGrid;
});
