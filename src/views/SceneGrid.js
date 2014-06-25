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
        // var cellSize = properties.cellSize || [properties.width / properties.dimensions[0], undefined];
        // var numCells;
        var cellSize = properties.cellSize || undefined;

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
              // content: 'hi' + (i + 1),
              size: [undefined, undefined],
              properties: {
                backgroundColor: "#FFFFF5",
                // backgroundBlendMode: "multiply",
                // boxShadow: "inset 0 0 20px rgba(255, 192, 203, .125)",
                // border: "1px dotted rgba(255, 192, 203, .5)",
                // color: "#404040",
                // textAlign: 'center'
              }
            });

            this._eventInput.subscribe(surface);
            surface.on('mouseenter', function(e){
                this.setProperties({
                    backgroundColor: "#FFFFA5",
                        // boxShadow: "inset 0 0 20px rgba(255, 192, 203, .125), 0 0 35px rgba(255, 255, 255, .5)",
                });
            });
            surface.on('mouseleave', function(e){
                this.setProperties({
                    backgroundColor: "#FFFFF5",
                    // boxShadow: "inset 0 0 20px rgba(255, 192, 203, .125)"
                });
            });
            surface.on('click', function(){
                var id = (this.id - 2) / 5;
                this.emit('prepareForSquare', id);
            });

            surface.on('click', function(){
                var id = this.id - 4;
                console.log(this.id);
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
