define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable     = require('famous/modifiers/Draggable');

    function WorkView() {
        View.apply(this, arguments);
        this.squares = {};
        this.numSquares = 0;
        
        _createBackground.call(this);
    }

    WorkView.prototype = Object.create(View.prototype);
    WorkView.prototype.constructor = WorkView;
    WorkView.prototype.createSquare = function() {
      this.numSquares++;
      console.log('creating square', this.numSquares);
      
      var draggable = new Draggable();
      
      var square = new Surface({
          size: [this.options.squareSize, this.options.squareSize],
          properties: {
              backgroundColor: 'pink',
          }
      });
        
      var squareModifier = new StateModifier({
          size: [this.options.squareSize, this.options.squareSize],
          opacity: 1,
          origin: [0.5, 0.5],
          align: [0.5, 0.5]
      });
      
      draggable.subscribe(square);
      var node = this.add(squareModifier).add(draggable).add(square);
      this.squares['square'+this.numSquares] = node;
    };

    WorkView.DEFAULT_OPTIONS = {
        squareSize: 50
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
