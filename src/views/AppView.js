define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Easing        = require('famous/transitions/Easing');

    var MenuView = require('views/MenuView');
    var WorkView = require('views/WorkView');
    var ModalOverlay = require('views/ModalOverlay');
    var SceneGrid = require('views/SceneGrid');
    var generate = require('utils/Generator');

    function AppView() {
        View.apply(this, arguments);

        this.menuToggle = false;

        _createWorkView.call(this);
        _createBackground.call(this);
        _createModalOverlay.call(this);
        _createGrid.call(this);
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
        center: [0.5, 0.5],
        dimensions: [100, 200],
        color: '#FFFFF5',
        size: 60,
        grid: {
            width: 960,
            height: 600,
            dimensions: [6, 8],
            cellSize: [60, 60]
        }
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
        this.workView = new WorkView(this.options);
        this.workModifier = new StateModifier({
            origin: this.options.center,
            align: this.options.center,
            size: [this.options.grid.width, this.options.grid.height]
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
            transform: Transform.translate(0, 0, -2)
        });

        this.add(backgroundModifier).add(background);
    }

    function _createModalOverlay() {
        this.modalOverlay = new ModalOverlay();
        this.add(this.modalOverlay);
    }

    function _createGrid() {
        this.grid = new SceneGrid(this.options.grid);
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
                var data = generate.sceneData(layouts, this.options.size);

                console.log(generate.output(data.scene, layouts));
            }
        };

        this.subscribe(this.modalOverlay._eventOutput);
        this.subscribe(this.workView._eventOutput);
        this.subscribe(this.grid._eventOutput);

        this.grid.on('createNewSquare', function(data) {
            console.log(data);
            this.workView.createLayoutView([data % 16, Math.floor(data / 16)]);
        }.bind(this));

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
