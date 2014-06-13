define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Easing        = require('famous/transitions/Easing');
    
    var MenuView = require('views/MenuView');
    var WorkView = require('views/WorkView');

    function AppView() {
        View.apply(this, arguments);
                
        this.menuToggle = false;
        
        _createMenuView.call(this);
        _createWorkView.call(this);
    }
    
    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    AppView.DEFAULT_OPTIONS = {
        menuSize: 150
    };
    
    function _createMenuView() {
        this.menuView = new MenuView();
        this.menuModifier = new StateModifier({
            size: [this.options.menuSize, undefined]
        });
        this.add(this.menuModifier).add(this.menuView);
    }
    
    function _createWorkView() {
        this.workView = new WorkView();
        this.workModifier = new StateModifier();
        this.add(this.workModifier).add(this.workView);
    }

    module.exports = AppView;
});
