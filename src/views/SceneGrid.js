define(function(require, exports, module) {
    var View                = require('famous/core/View');
    var Surface             = require('famous/core/Surface');
    var OptionsManager      = require('famous/core/OptionsManager');
    var GridLayoutCellSized = require('views/GridLayoutCellSized');

    function SceneGrid(options) {
        View.call(this);

        this.options = Object.create(SceneGrid.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        _createGrid.call(this);
        _setListeners.call(this);
    }

    SceneGrid.prototype = Object.create(View.prototype);
    SceneGrid.prototype.constructor = SceneGrid;

    SceneGrid.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    SceneGrid.DEFAULT_OPTIONS = {};

    function _createGrid() {
        var grid = new GridLayoutCellSized({
            dimensions: [this.options.width, this.options.height],
            cellSize: this.options.cellSize
        });

        var surfaces = [];
        grid.sequenceFrom(surfaces);

        var cells = this.options.rows * this.options.cols;

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
