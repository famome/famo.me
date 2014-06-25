define(function(require, exports, module) {
    var View                = require('famous/core/View');
    var Surface             = require('famous/core/Surface');
    var GridLayoutCellSized = require('views/GridLayoutCellSized');


    

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

        var grid = new GridLayoutCellSized({
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
            // console.log('this.id:', this.id, 'id:', id);
            this.emit('prepareForSquare', this.id-1);
        });
    }

    function _setListeners() {
        this._eventInput.on('prepareForSquare', function(data) {
            this._eventOutput.emit('createNewSquare', data);
        }.bind(this));
    }

    module.exports = SceneGrid;
});
