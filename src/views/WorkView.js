define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draginator    = require('Draginator');
    var LayoutView    = require('views/LayoutView');
    var Engine        = require('famous/core/Engine');
    var Modifier      = require('famous/core/Modifier');
    var RenderController = require('famous/views/RenderController');
    var SceneGrid = require('views/SceneGrid');
    var Flipper       = require('famous/views/Flipper');
    var Timer             = require('famous/utilities/Timer');


    function WorkView() {
        View.apply(this, arguments);
        this.numLayouts = 0;
        this.layouts = {};
        this.layoutsList = [];
        this.selectedLayout = undefined;
window.wv = this; // testing only
        _createRenderController.call(this);
        _createGrid.call(this);
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
    };

    WorkView.DEFAULT_OPTIONS = {
        flipDelay: 1000,
        center: [0.5, 0.5],
        dimensions: [100, 200],
        surface: '#FFFFF5',
        dotColor: '#B2F5D9',
        grid: {
            width: 960,
            height: 600,
            dimensions: [6, 8],
            cellSize: [120, 120] // Dominates dimensions
        }
    };

    function _createRenderController() {
        this.renderController = new RenderController({
            inTransition: false,
            outTransition: false,
            overlap: false
        });

        this.add(this.renderController);
    }

    function _createGrid() {
        this.grid = new SceneGrid(this.options.grid);
        this.gridModifier = new StateModifier({
            origin: this.options.center,
            size: [this.options.grid.width, this.options.grid.height]
        });

        this.renderController.add(this.gridModifier).add(this.grid);
        this.renderController.show(this.grid);

        this.flipper = new Flipper({
            direction: 1
        });

        this.flipper.setFront(this.renderController);
        this.back = new Surface({
            properties: {
                backgroundColor: this.options.dotColor,
                webkitBackfaceVisibility: 'visible',
                backfaceVisibility: 'visible'
            }
        });
        this.flipper.setBack(this.back);

        var centerModifier = new Modifier({origin : this.options.center});

        this.gridNode = this.add(centerModifier).add(this.flipper);


        var show = function() {
            this.back.setContent('');
            this.back.setProperties({
                backgroundColor: this.options.white
            });
            Timer.setTimeout(function() {   // debounce doesn't work
                this.renderController.show(this.grid, {duration: this.options.flipDelay});
            }.bind(this), this.options.flipDelay);
        };

        var hide = function() {
            this.renderController.hide({duration: 0});
            this.back.setProperties({
                backgroundColor: this.options.dotColor
            });
        };

        var toggle = false;
        this.flip = function(){
            toggle ? show.call(this) : hide.call(this);
            var angle = toggle ? 0 : Math.PI;
            this.flipper.setAngle(angle, {curve : 'easeOutBounce', duration : this.options.flipDelay});
            toggle = !toggle;
        }.bind(this);
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
