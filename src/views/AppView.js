define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    var MenuView = require('views/MenuView');
    var WorkView = require('views/WorkView');
    var ModalOverlay = require('views/ModalOverlay');

    var generate = require('utils/Generator');

    function AppView() {
        View.apply(this, arguments);

        this.menuToggle = false;

        _createWorkView.call(this);
        _createBackground.call(this);
        _createModalOverlay.call(this);
        _createMenuView.call(this);
        _setListeners.call(this);
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

    module.exports = AppView;
});
