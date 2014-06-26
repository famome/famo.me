define(function(require, exports, module) {
    var View             = require('famous/core/View');
    var Timer            = require('famous/utilities/Timer');
    var Flipper          = require('famous/views/Flipper');
    var Surface          = require('famous/core/Surface');
    var Modifier         = require('famous/core/Modifier');
    var SceneGrid        = require('views/SceneGrid');
    var LayoutView       = require('views/LayoutView');
    var StateModifier    = require('famous/modifiers/StateModifier');
    var OptionsManager   = require('famous/core/OptionsManager');
    var RenderController = require('famous/views/RenderController');


    function WorkView(options) {
        View.apply(this);

        this.options = Object.create(WorkView.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) this.setOptions(options);

        this.numLayouts = 0;
        this.layoutsList = [];
        this.selectedLayout = undefined;

        _createGrid.call(this);
        _createFlipper.call(this);
        _setListeners.call(this);
        _setKeybinds.call(this);
    }

    WorkView.prototype = Object.create(View.prototype);
    WorkView.prototype.constructor = WorkView;

    WorkView.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };
    // needs refactoring
    WorkView.prototype.createLayoutView = function(offset) {
        this.numLayouts++;
        var layoutView = new LayoutView({
            size: {
                width: this.options.width/this.options.cols,
                height: this.options.height/this.options.rows
            },
            screen: {
                width: this.options.width,
                height: this.options.height
            }
            offset: (offset || [0, 0])
        });
        layoutView.linkTo(this.layoutsList, this.numLayouts);
        layoutView.addLayout();

        this.add(layoutView);

        this._eventOutput.pipe(layoutView._eventInput);
        layoutView._eventOutput.pipe(this._eventInput);

        layoutView.draginator.eventOutput.pipe(this);

        this._eventOutput.emit('deselect');
        this._eventOutput.emit('select', layoutView);

        this.selectedLayout = layoutView;
    };

    WorkView.prototype.getLayoutsList = function() {
        return this.layoutsList;
    };

    WorkView.prototype.flip = function() {
        this.toggle ? _showCodeDisplay.call(this) : _hideCodeDisplay.call(this);
        var angle = this.toggle ? 0 : Math.PI;
        this.flipper.setAngle(angle, {curve : 'easeOutBounce', duration : this.options.flipDelay});
        this.toggle = !this.toggle;
    };

    WorkView.DEFAULT_OPTIONS = {
        flipDelay: 1000,
        dimensions: [100, 200],
        flipperBackColor: '#B2F5D9',
        surface: '#FFFFF5'
    };

    function _createGrid() {
        this.renderController = new RenderController();
        this.grid = new SceneGrid({
            width: this.options.width,
            height: this.options.height,
            cols: this.options.cols,
            rows: this.options.rows,
            cellSize: [this.options.width/this.options.cols, this.options.height/this.options.rows]
        });
        this.gridModifier = new StateModifier({
            origin: [0.5, 0.5],
            size: [this.options.width, this.options.height]
        });

        this.renderController.add(this.gridModifier).add(this.grid);
        this.renderController.show(this.grid);
    }

    function _createFlipper() {
        this.toggle = false;

        this.flipper = new Flipper({
            direction: Flipper.DIRECTION_Y
        });

        this.codeDisplay = new Surface({
            properties: {
                backgroundColor: this.options.flipperBackColor,
                webkitBackfaceVisibility: 'visible',
                backfaceVisibility: 'visible'
            }
        });

        this.flipper.setFront(this.renderController);
        this.flipper.setBack(this.codeDisplay);

        this.add(new Modifier({origin : [0.5, 0.5]})).add(this.flipper);
    }

    function _showCodeDisplay() {
        this.codeDisplay.setContent('');
        this.codeDisplay.setProperties({
            backgroundColor: this.options.white
        });

        Timer.setTimeout(function() {   // debounce doesn't work
            this.renderController.show(this.grid, {duration: this.options.flipDelay});
        }.bind(this), this.options.flipDelay);
    }

    function _hideCodeDisplay() {
        this.renderController.hide({duration: 0});
        this.codeDisplay.setProperties({
            backgroundColor: this.options.flipperBackColor
        });
    }

    function _setKeybinds() {
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
    }

    function _setListeners() {
        this._eventInput.on('deselectRest', function(selectedLayout) {
            this.selectedLayout = selectedLayout;
            this._eventOutput.emit('deselect');
        }.bind(this));

        this._eventInput.on('cycleToNextLayout', function(index) {
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
            this._eventOutput.emit('activate', '⿴');
        }.bind(this));

        this._eventInput.on('createNewLayout', function() {
            this.createLayoutView();
        }.bind(this));

        this._eventInput.on('editMyProperties', function(layoutView) {
            _editProperties.call(this, layoutView);
        }.bind(this));

        this._eventInput.on('editPropertiesOfSelected', function() {
            _editProperties.call(this, this.selectedLayout);
        }.bind(this));

        this.subscribe(this.grid._eventOutput);

        this.grid.on('createNewSquare', function(data) {
            this.createLayoutView([data % this.options.cols, Math.floor(data / this.options.cols)]);
        }.bind(this));
    }

    function _editProperties(layoutView) {
        this._eventOutput.emit('editSelectedLayoutView');
    }

    module.exports = WorkView;
});
