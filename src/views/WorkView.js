define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draginator    = require('Draginator');
    var LayoutView    = require('views/LayoutView');
    var RenderController = require('famous/views/RenderController');

    function WorkView() {
        View.apply(this, arguments);
        this.numLayouts = 0;
        this.layouts = {};
        this.layoutsList = [];
        this.selectedLayout = undefined;
window.wv = this; // testing only
        _createRenderController.call(this);
        _setListeners.call(this);
    }

    WorkView.prototype = Object.create(View.prototype);
    WorkView.prototype.constructor = WorkView;
    WorkView.prototype.toggleHeader = function() {
        this.header = !this.header;
    };

    WorkView.prototype.toggleFooter = function() {
        this.footer = !this.footer;
    };

    WorkView.prototype.createLayoutView = function(offset) {
        this.numLayouts++;

        var layoutView = new LayoutView(offset);
        layoutView.linkTo(this.layouts, this.layoutsList, this.numLayouts);
        layoutView.addLayout();

        this.add(layoutView);

        this._eventOutput.pipe(layoutView._eventInput);
        layoutView._eventOutput.pipe(this._eventInput);

        layoutView.draginator.eventOutput.pipe(this);

        this._eventOutput.emit('deselect');
        this._eventOutput.emit('select', layoutView);

        this.selectedLayout = layoutView;
    };

    WorkView.prototype.getLayouts = function() {
        return this.layouts;
    };

    WorkView.prototype.getLayoutsList = function() {
        return this.layoutsList;
    }

    WorkView.DEFAULT_OPTIONS = {
        // center: [0.5, 0.5],
        // dimensions: [100, 200],
        // color: '#FFFFF5',
        // grid: {
        //     width: 960,
        //     height: 600,
        //     dimensions: [6, 8],
        //     cellSize: [120, 120] // Dominates dimensions
        // }
    };

    function _createGrid() {
        this.grid = new SceneGrid(this.options.grid);
        // this.gridModifier = new StateModifier({
        //     origin: [0.5, 0.5],
        //     align: [0.5, 0.5],
        //     size: [this.options.grid.width, this.options.grid.height]
        // });

        // this.gridNode = this.add(this.gridModifier).add(this.grid);
        this.add(this.grid);
    }

    function _createRenderController() {
        var renderController = new RenderController();
        this.add(renderController);
    }

    function _createWorkSurface() {
        var workSurface = new Surface({
            size: this.options.dimensions,
            properties: {
                backgroundColor: this.options.color
            }
        });

        var workSurfaceModifier = new StateModifier({
            origin: this.options.center,
            align: this.options.center
        });

        this.add(workSurfaceModifier).add(workSurface);
    }

    function _setListeners() {
        this._eventInput.on('deselectRest', function(selectedLayout) {
            this.selectedLayout = selectedLayout;
            this._eventOutput.emit('deselect');
        }.bind(this));

        this._eventInput.on('cycleToNextLayout', function(index) {
            console.log('cycling from', index);
            this._eventOutput.emit('deselect');
            if (index + 1 >= this.layoutsList.length) {
                var nextLayout = this.layoutsList[0];
                this.selectedLayout = nextLayout;
                nextLayout.selectSurface();
            } else {
                var nextLayout = this.layoutsList[index + 1];
                this.selectedLayout = nextLayout;
                nextLayout.selectSurface();
            }
        }.bind(this));

        this._eventInput.on('generate', function() {
            console.log('generating?');
            this._eventOutput.emit('activate', '⿴');
        }.bind(this));

        window.onkeydown = function(event) {
            if (event.keyIdentifier === 'U+004E') {
                console.log('U+004E!!!');
                this.createLayoutView();
            }

            // ESC key edits properties of selected view
            if (event.keyCode === 27) {
                console.log('ESC!');
                _editProperties.call(this, this.selectedLayout);
            }
        }.bind(this);

        this._eventInput.on('createNewLayout', function() {
            console.log(this);
            this.createLayoutView();
        }.bind(this));

        // this._eventInput.on('allowCreation', function() {
        //     window.onkeydown = function(event) {
        //         if (event.keyIdentifier === 'U+004E') {
        //             this.createLayoutView();
        //         }
        //     }.bind(this);
        // }.bind(this));

        this._eventInput.on('editMyProperties', function(layoutView) {
            console.log('heard event editMyProperties');
            _editProperties.call(this, layoutView);
        }.bind(this));

        this._eventInput.on('editPropertiesOfSelected', function() {
            console.log('heard event editPropertiesOfSelected');
            _editProperties.call(this, this.selectedLayout);
        }.bind(this));
    }

    function _editProperties(layoutView) {
        console.log('edit lv properties');
        this._eventOutput.emit('editSelectedLayoutView');
    }

    module.exports = WorkView;
});
