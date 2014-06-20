define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Easing        = require('famous/transitions/Easing');

    var MenuView = require('views/MenuView');
    var WorkView = require('views/WorkView');
    var generate = require('utils/Generator');

    var SceneGrid = require('views/SceneGrid');

    function AppView() {
        View.apply(this, arguments);

        this.menuToggle = false;

        _createMenuView.call(this);
        _createWorkView.call(this);
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
        menuSize: 150
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
        this.workView = new WorkView();
        this.workModifier = new StateModifier();
        this.add(this.workModifier).add(this.workView);
        window.work = this.workView;
    }

    function _setListeners() {
        var events = {
            '⬒': function() {
                this.workView.toggleHeader();
            },
            '⬓': function() {
                this.workView.toggleFooter();
            },
            '▤': function() {
                console.log('you clicked a row thing');
            },
            '▥': function() {
                console.log('you clicked a column thing');
            },
            '□': function() {
                this.workView.createLayoutView();
            },
            '⿴': function() {
                var data = generate.sceneData(this.workView.getLayouts(), 100);
                var scene = generate.scene(data.scene);

                for (var surface in data.surfaces) {
                    scene.id[surface].add(data.surfaces[surface]);
                }

                this.add(scene);
            }
        };

        this.menuView.on('menu', function() {
            events[this.menuView.current].bind(this)();
        }.bind(this));

        // this.on('keydown', function(event) {
        //     if (event.altKey) {
        //         console.log('keydown');
        //     }
        // }, false);

        // this.on('keyup', function(event) {
        //     if (!event.altKey) {
        //         console.log('keydown with option-key');
        //     }
        // }, false);
    }


    module.exports = AppView;
});
