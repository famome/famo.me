define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable     = require('famous/modifiers/Draggable');

    var ToolView      = require('views/ToolView');

    function MenuView() {
        View.apply(this, arguments);
        
        var draggable = new Draggable();
        
        _createToolMenu.call(this, draggable);
        _createSquareTool.call(this, draggable);
    }

    MenuView.prototype = Object.create(View.prototype);
    MenuView.prototype.constructor = MenuView;

    MenuView.DEFAULT_OPTIONS = {
        topOffset: 50
    };
    
    function _createToolMenu(draggable) {
        this.toolMenu = new Surface({
            size: [this.options.menuSize, undefined],
            properties: {
                backgroundColor: '#FFFFF5',
                zIndex: 1
            }
        });
                
        this.toolMenuModifier = new StateModifier({
            opacity: 0.75,
            transform: Transform.translate(0, 0, 1)
        });
        
        draggable.subscribe(this.toolMenu);
        
        
        this.add(this.toolMenuModifier).add(draggable).add(this.toolMenu);
    }
    
    function _createSquareTool(draggable) {
        this.squareTool = new ToolView();
        this.squareToolModifier = new StateModifier({
            transform: Transform.translate(0, this.options.topOffset, 0)
        });
        
        draggable.subscribe(this.squareTool);
        this.add(this.squareToolModifier).add(draggable).add(this.squareTool);
    }

    module.exports = MenuView;
});
