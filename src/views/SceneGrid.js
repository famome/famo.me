define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var StateModifier = require('famous/modifiers/StateModifier');

    var GridLayout    = require('views/GridLayoutCellSized');
    var Flipper       = require('famous/views/Flipper');

    var sceneGrid = new GridLayout();

    function SceneGrid(properties) {
        View.apply(this, arguments);

        _createGrid.call(this, properties);
    }

    SceneGrid.prototype = Object.create(View.prototype);
    SceneGrid.prototype.constructor = SceneGrid;

    SceneGrid.DEFAULT_OPTIONS = {
        dotSize: 4,
        dotColor: '#B2F5D9'
    };

    function _createGrid(properties) {
        cellSize = properties.cellSize;

        var grid = new GridLayout({
            dimensions: properties.dimensions,
            cellSize: cellSize
        });

        grid.surfaces = [];
        grid.sequenceFrom(grid.surfaces);
        var cols = properties.width / properties.cellSize[0];
        var rows = properties.height / properties.cellSize[1];
        var cells = rows * cols;

        for(var i = 0; i < cells; i++) {
            var view = new View();
            var surface = new Surface({
              size: [undefined, undefined],
              properties: {
                backgroundColor: "#FFFFF5",
              }
            });
            this._eventInput.subscribe(surface);

            this._eventInput.subscribe(surface);

            surface.on('mouseenter', function(e){
                this.setProperties({
                    backgroundColor: "#FFFFA5",
                });
            });
            surface.on('mouseleave', function(e){
                this.setProperties({
                    backgroundColor: "#FFFFF5",
                });
            });
            surface.on('click', function(){
                var id = this.id - 1;
                this.emit('prepareForSquare', id);
            });
            grid.surfaces.push(surface);
        }

        this._eventInput.on('prepareForSquare', function(data) {
            console.log(data);
            this._eventOutput.emit('createNewSquare', data);
        }.bind(this));

        this.add(grid);
    }

    module.exports = SceneGrid;
});
