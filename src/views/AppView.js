define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Modifier      = require('famous/core/Modifier');
    var Transform     = require('famous/core/Transform');

    var MenuView      = require('views/MenuView');
    var WorkView      = require('views/WorkView');
    var ModalOverlay  = require('views/ModalOverlay');

    var StateModifier = require('famous/modifiers/StateModifier');

    var InputSurface  = require('famous/surfaces/InputSurface');

    var Generator      = require('utils/Generator');
    var docCookies    = require('utils/cookies'); // Simple cookies framework from MDN

    function AppView() {
        View.apply(this, arguments);

        this.menuToggle = false;
        this.generator = new Generator();

        _eventCookiesHandler.call(this);
        // _checkCookies.call(this);

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
        width: 720,
        height: 600,
        dimensions: [12, 10],
    };

    function _eventCookiesHandler() {
        // docCookies.eventOutput = new EventHandler();
        // EventHandler.setOutputHandler(docCookies, docCookies.eventOutput);

        // docCookies.eventOutput.pipe(this._eventInput);
        _handleDimensions.call(this, [
            this.options.width,
            this.options.height,
            this.options.dimensions[0],
            this.options.dimensions[1]
        ]);
    }

    function _checkCookies() {
        var dimensions;
        if (dimensions = docCookies.getItem('dimensions')) {
            _handleDimensions.call(this, dimensions.split(','));
        } else {
            _createModalOverlay.call(this);
            _getWorkviewSizeFromUser.call(this);
        }
    }

    function _createMenuView() {
        this.menuView = new MenuView();
        this.menuModifier = new StateModifier({
            size: [this.options.menuSize, 100],
            origin: [1, 0]
        });
        this.add(this.menuModifier).add(this.menuView);
        requestAnimationFrame(function() {
            for (var i = 0; i < this.menuView.icons.length; i++) {
                var el = document.getElementsByClassName(this.menuView.iconNames[i]);
                el[0].setAttribute('data-hint', this.menuView.tooltipsText[i]);
            }
        }.bind(this));
    }

    function _createWorkView() {
        this.workView = new WorkView({
            width: this.options.width,
            height: this.options.height,
            cols: this.options.cols,
            rows: this.options.rows
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

    function _setListeners() {
        var events = {
            '□': function() {
                this.workView.createLayoutView();
            },
            '⿴': function() {
                this.generator.generate(this.workView.getLayoutsList(), this.options.width, this.options.height);
                // this.generator.toggle();
                var output = this.generator.getActiveOutput();
                var formatted = hljs.highlight('javascript', output);

                // refactor inline style
                this.workView.codeDisplay.setContent('<pre id="code" style="background-color: transparent">'+formatted.value+'</pre>');
                this.workView.codeDisplay.setProperties({
                    overflowY: 'scroll',
                    overflowX: 'hidden'
                });

                this.workView.flip();
            },
            '❖': function() {
                this.generator.generate(this.workView.getLayoutsList(), this.options.width, this.options.height);
                this.generator.toggle();
                var output = this.generator.getActiveOutput();
                var formatted = hljs.highlight('javascript', output);

                // refactor inline style
                this.workView.codeDisplay.setContent('<pre id="code" style="background-color: transparent">'+formatted.value+'</pre>');
                this.workView.codeDisplay.setProperties({
                    overflowY: 'scroll',
                    overflowX: 'hidden'
                });

                this.workView.flip();
            },
            '⏍': function() {
                console.log('Add image surface');
            },
            '⍰': function() {
            }
        };



        this.subscribe(this.modalOverlay._eventOutput);
        this.subscribe(this.workView._eventOutput);
        this.subscribe(this.menuView._eventOutput);

        this.menuView.on('□', function(info) {
            console.log(info);
        });

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
        var width = dimensions[0];
        var height = dimensions[1];
        var gridDimensions = [dimensions[2], dimensions[3]];
        var cellSize = [width/gridDimensions[0], height/gridDimensions[1]];
        this.options.width = width;
        this.options.height = height;
        this.options.cols = dimensions[2];
        this.options.rows = dimensions[3];
        _generateViews.call(this);
    }

    function _generateViews() {
        _createWorkView.call(this);
        _createBackground.call(this);
        _createModalOverlay.call(this);
        _createMenuView.call(this);
        _setListeners.call(this);
    }

    module.exports = AppView;
});
