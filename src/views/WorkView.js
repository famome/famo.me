define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draginator    = require('Draginator');
    
    var BasicLayout   = require('utils/BasicLayout');
    
    
    
    var RenderController = require('famous/views/RenderController');

    function WorkView() {
        View.apply(this, arguments);
        this.squares = {};
        this.numSquares = 0;
        
        this.renderController = new RenderController();
        this.add(this.renderController);
        
        BasicLayout.createContent.call(this);
    }

    WorkView.prototype = Object.create(View.prototype);
    WorkView.prototype.constructor = WorkView;
    WorkView.prototype.toggleHeader = function() {
        this.header = !this.header;
        this.createHeaderFooter();
    };
    
    WorkView.prototype.toggleFooter = function() {
        this.footer = !this.footer;
        this.createHeaderFooter();
    };
    
    WorkView.prototype.createHeaderFooter = function() {
        BasicLayout.render.call(this);
    };
    
    WorkView.prototype.createSquare = function() {
      this.numSquares++;
      console.log('creating square', this.numSquares);
      
      var draginator = new Draginator();

      var square = new Surface({
          size: [this.options.squareSize, this.options.squareSize],
          properties: {
              backgroundColor: 'pink',
          },
      });
        
      var squareModifier = new StateModifier({
          origin: [0.5, 0.5],
          align: [0.5, 0.5]
      });
      
      square.on('dblclick', function() {
          square.setContent('click?');
          square.setProperties({
              textAlign: 'center'
          });
      }.bind(this));
      
      draginator.subscribe(square);
      var node = this.add(squareModifier).add(draginator).add(square);
      this.squares['square'+this.numSquares] = node;
    };

    WorkView.DEFAULT_OPTIONS = {
        squareSize: 50
    };

    module.exports = WorkView;
});
