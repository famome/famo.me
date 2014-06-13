define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    function WorkView() {
        View.apply(this, arguments);
        
        _createBackground.call(this);
    }

    WorkView.prototype = Object.create(View.prototype);
    WorkView.prototype.constructor = WorkView;

    WorkView.DEFAULT_OPTIONS = {
        
    };
    
    function _createBackground() {
        var background = new Surface({
            size: [undefined, undefined],
            classes: ["grey-bg"],
            properties: {
                zIndex: -1
            }
        });
        
        var backgroundModifier = new StateModifier({
            transform: Transform.translate(0, 0, -1)
        });
        
        this.add(backgroundModifier).add(background);
    }

    module.exports = WorkView;
});
