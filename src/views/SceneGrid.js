define(function(require, exports, module) {
<<<<<<< HEAD
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var GridLayout    = require('views/GridLayoutCellSized');
    var EventHandler  = require('famous/core/EventHandler');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Flipper       = require('famous/views/Flipper');

    var sceneGrid = new GridLayout();

    // properties isn't a good pattern because view will be applied with arguments, which will include properties--refactor
    function SceneGrid(properties) {
        View.apply(this, arguments);

        _createGrid.call(this, properties);
        _setListeners.call(this);
    }

    SceneGrid.prototype = Object.create(View.prototype);
    SceneGrid.prototype.constructor = SceneGrid;

    SceneGrid.DEFAULT_OPTIONS = {};

    function _createGrid(properties) {
        var cellSize = properties.cellSize;

        var grid = new GridLayout({
            dimensions: properties.dimensions,
            cellSize: cellSize
        });

        var surfaces = [];
        grid.sequenceFrom(surfaces);
        var cols = properties.width / properties.cellSize[0];
        var rows = properties.height / properties.cellSize[1];
        var cells = rows * cols;

        for(var i = 0; i < cells; i++) {
            var view = new View();
            var surface = new Surface({
              properties: {
                backgroundColor: '#FFFFF5',
              }
            });

            this._eventInput.subscribe(surface);

            _setCellListeners.call(this, surface);

            view.add(surface);
            surfaces.push(view);
        }

        this.add(grid);
    }

    function _setCellListeners(surface) {
        this._eventInput.subscribe(surface);

        surface.on('mouseenter', function(){
            this.setProperties({
                backgroundColor: '#FFFFA5',
            });
        });

        surface.on('mouseleave', function(){
            this.setProperties({
                backgroundColor: '#FFFFF5',
            });
        });

        surface.on('click', function(){
            var id = (this.id - 2) / 5;
            this.emit('prepareForSquare', id);
        });
    }

    function _setListeners() {
        this._eventInput.on('prepareForSquare', function(data) {
            this._eventOutput.emit('createNewSquare', data);
        }.bind(this));
    }

    module.exports = SceneGrid;
});
