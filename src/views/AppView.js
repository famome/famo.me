define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var Modifier     = require('famous/core/Modifier');
    var EventHandler = require('famous/core/EventHandler')
    var StateModifier = require('famous/modifiers/StateModifier');
    var Easing        = require('famous/transitions/Easing');
    var InputSurface  = require('famous/surfaces/InputSurface');
    var MenuView = require('views/MenuView');
    var WorkView = require('views/WorkView');
    var ModalOverlay = require('views/ModalOverlay');

    var generate = require('utils/Generator');

    // Simple cookies framework from MDN
    var docCookies = require('./cookies');

    function AppView() {
        View.apply(this, arguments);

        this.menuToggle = false;


        _eventCookiesHandler.call(this);

        _createModalOverlay.call(this);
        _getWorkviewSizeFromUser.call(this);

        this._eventInput.on('updateDimensions', _handleDimensions.bind(this));
    }

    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    AppView.prototype.createWorkLayoutView = function() {
        this.workView.createLayoutView();
    };

    AppView.prototype.toggleHeader = function() {
        this.workView.toggleHeader();
    };

    AppView.prototype.toggleFooter = function() {
        this.workView.toggleFooter();
    };

    AppView.DEFAULT_OPTIONS = {
        menuSize: 150,
        size: 60,
        width: 960,
        height: 600,
        dimensions: [6, 8],
        cellSize: [60, 60]
    };

    function _eventCookiesHandler() {
        docCookies.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(docCookies, docCookies.eventOutput);

        docCookies.eventOutput.pipe(this._eventInput);
    }

    function _createMenuView() {
        this.menuView = new MenuView();
        this.menuModifier = new StateModifier({
            size: [this.options.menuSize, undefined],
            origin: [1, 0]
        });
        this.add(this.menuModifier).add(this.menuView);
    }

    function _createWorkView() {
        this.workView = new WorkView({
            width: this.options.width,
            height: this.options.height
        });

        this.workModifier = new StateModifier({
            origin: [0.5, 0.5],
            size: [this.options.width, this.options.height]
        });

        this.add(this.workModifier).add(this.workView);
    }

    function _createBackground() {
        var background = new Surface({
            size: [undefined, undefined],
            classes: ['grey-bg'],
            properties: {
                lineHeight: '150px',
                textAlign: 'center',
                zIndex: -1
            }
        });

        var backgroundModifier = new StateModifier({
            transform: Transform.translate(0, 0, -1)
        });

        this.add(backgroundModifier).add(background);

    }

    function _createModalOverlay() {
        this.modalOverlay = new ModalOverlay();
        this.add(this.modalOverlay);
    }

    function _createGrid() {
        this.grid = new SceneGrid(this.options.grid);
        this.grid.app = this;
        this.gridModifier = new StateModifier({
            origin: this.options.center,
            align: this.options.center,
            size: [this.options.grid.width, this.options.grid.height]
        });

        this.gridNode = this.add(this.gridModifier).add(this.grid);
    }

    function _setListeners() {
        var events = {
            '□': function() {
                this.workView.createLayoutView();
            },
            '⿴': function() {
                var layouts = this.workView.getLayouts();
                var data = generate.sceneData(layouts);
                var output = generate.output(data.scene, layouts);
                var formatted = hljs.highlight('javascript', output);

                // refactor inline style
                this.workView.codeDisplay.setContent('<pre id="code" style="background-color: transparent">'+formatted.value+'</pre>');
                this.workView.codeDisplay.setProperties({
                    overflowY: 'scroll',
                    overflowX: 'hidden'
                });

                this.workView.flip();
            }
        };



        this.subscribe(this.modalOverlay._eventOutput);
        this.subscribe(this.workView._eventOutput);

        this.workView.on('activate', function(menuIcon) {
            events[menuIcon].bind(this)();
        }.bind(this));

        this.menuView.on('menu', function() {
            events[this.menuView.current].bind(this)();
        }.bind(this));

        this.workView.on('editSelectedLayoutView' , function() {
            this.modalOverlay.modifier.setTransform(Transform.translate(0, 0, 99));
            this.modalOverlay.state = true;
        }.bind(this));
    }

    function _getWorkviewSizeFromUser() {
        if (!docCookies.getItem("workViewDimensions")) {
console.log('no cookies, but i got this great modalOverlay ', this.modalOverlay);
            var modal = this.modalOverlay;
            modal.modifier.setTransform( Transform.translate(0, 0, 8) );
            var inputWidth = new InputSurface({
                size: [200, 80],
                name: 'width',
                placeholder: 'WIDTH',
                value: '',
                type: 'text'
            });

            var inputHeight = new InputSurface({
                size: [200, 80],
                name: 'height',
                placeholder: 'HEIGHT',
                value: '',
                type: 'text'
            });

            var inputCols = new InputSurface({
                size: [200, 80],
                name: 'Cols',
                placeholder: 'COLS',
                value: '',
                type: 'text'
            });

            var inputRows = new InputSurface({
                size: [200, 80],
                name: 'Rows',
                placeholder: 'ROWS',
                value: '',
                type: 'text'
            });

            this.modalOverlay.modalNode.add(new Modifier({origin: [0.5, 0.5], align: [0.5, .2], properties: {zIndex:999}})).add(inputWidth);
            this.modalOverlay.modalNode.add(new Modifier({origin: [0.5, 0.5], align: [0.5, .4], properties: {zIndex:999}})).add(inputHeight);
            this.modalOverlay.modalNode.add(new Modifier({origin: [0.5, 0.5], align: [0.5, .6], properties: {zIndex:999}})).add(inputCols);
            this.modalOverlay.modalNode.add(new Modifier({origin: [0.5, 0.5], align: [0.5, .8], properties: {zIndex:999}})).add(inputRows);
        }

        window.onkeydown = function(e) {
            // Enter Key was pressed
            if (e.keyCode === 13) {
                var inputs = document.getElementsByTagName('input')
                var inps = Array.prototype.slice.call(inputs);
                var dims = [];
                inps.forEach(function(el) {
                    dims.push(el.value);
                });

                // Set cookie and update views when options are all set
                if ( dims.indexOf("") === -1 && dims.length === 4 ) {
                    docCookies.setItem('dimensions', dims);
                    var dimensions = docCookies.getItem('dimensions')
                        .split(',')
                        .map(function(item) {
                            return parseInt(item);
                        });

                        this.modalOverlay.modifier.setTransform(Transform.translate(0, 0, -3));
                        docCookies.eventOutput.emit('updateDimensions', dimensions);
                }
            }
        }.bind(this);
    }

    function _handleDimensions(dimensions) {
            console.log('appView heard you!', dimensions);
            var width = dimensions[0];
            var height = dimensions[1];
            var gridDimensions = [dimensions[2], dimensions[3]];
            var cellSize = [width/gridDimensions[0], height/gridDimensions[1]];
            this.options.grid = {
                width: width,
                height: height,
                dimensions: gridDimensions,
                cellSize: cellSize
            }
            _createWorkView.call(this);
            _createBackground.call(this);
            _createModalOverlay.call(this);
            _createGrid.call(this);
            _createMenuView.call(this);
            _setListeners.call(this);
        }

    module.exports = AppView;
});
