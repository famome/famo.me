define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var StateModifier = require('famous/modifiers/StateModifier');
    
    var GridLayout    = require('views/GridLayoutCellSized');

    var sceneGrid = new GridLayout();

    function SceneGrid(properties) {
        View.apply(this, arguments);

        return _createGrid.call(this, properties);
    }

    SceneGrid.prototype = Object.create(View.prototype);
    SceneGrid.prototype.constructor = SceneGrid;

    SceneGrid.DEFAULT_OPTIONS = {
        dotSize: 4,
        dotColor: '#b2f5d9'
    };

    function _createGrid(properties) {
        // var cellSize = properties.cellSize || [properties.width / properties.dimensions[0], undefined];
        // var numCells;
        cellSize = properties.cellSize || undefined;

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

            var topLeftModifier = new StateModifier({
                size: [this.options.dotSize, this.options.dotSize],
                origin: [0, 0]
            });

            var topLeftCorner = new Surface({
                size: [this.options.dotSize, this.options.dotSize],
                properties: {
                    pos: [0, 0],
                    borderRadius: '0 0 100% 0',
                    background: this.options.dotColor,
                }
            });
            
            var topRightModifier = new StateModifier({
                size: [this.options.dotSize, this.options.dotSize],
                origin: [1, 0]
            });

            var topRightCorner = new Surface({
                properties: {
                    borderRadius: '0 0 0 100%',
                    background: this.options.dotColor,
                    // position: 'absolute'
                }
            });

            var bottomLeftModifier = new StateModifier({
                size: [this.options.dotSize, this.options.dotSize],
                origin: [0, 1]
            });
            
            var bottomLeftCorner = new Surface({
                properties: {
                    borderRadius: '0 100% 0 0',
                    background: this.options.dotColor,
                    // position: 'absolute'
                }
            });

            var bottomRightModifier = new StateModifier({
                size: [this.options.dotSize, this.options.dotSize],
                origin: [1, 1]
            });
            
            var bottomRightCorner = new Surface({
                properties: {
                    borderRadius: '100% 0 0 0',
                    background: this.options.dotColor,
                    // position: 'absolute'
                }
            });

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
            view.add(surface);
            view.add(topLeftModifier).add(topLeftCorner);
            view.add(topRightModifier).add(topRightCorner);
            view.add(bottomLeftModifier).add(bottomLeftCorner);
            view.add(bottomRightModifier).add(bottomRightCorner);

            // view.add(topLeftCorner);
            grid.surfaces.push(view);
        }

        return grid;
    }

    module.exports = SceneGrid;
});
