define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    function ToolView() {
        View.apply(this, arguments);
        
        _createTool.call(this);
        _setListeners.call(this);
    }

    ToolView.prototype = Object.create(View.prototype);
    ToolView.prototype.constructor = ToolView;

    ToolView.DEFAULT_OPTIONS = {
        size: 50
    };
    
    function _createTool() {
        this.tool = new Surface({
            size: [this.options.size, this.options.size],
            properties: {
                backgroundColor: 'pink',
                zIndex: 1,
            }
        });
                
        this.toolModifier = new StateModifier({
            opacity: 1,
            transform: Transform.translate(0, 0, 1)
        });
        
        this.add(this.toolModifier).add(this.tool);
    }
    
    function _setListeners() {
      this.tool.on('click', function() {
        this._eventOutput.emit('toolClick');
      }.bind(this));
    }

    module.exports = ToolView;
});
