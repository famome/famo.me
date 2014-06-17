define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draginator    = require('Draginator');
    var BasicLayout   = require('utils/BasicLayout');
    var RenderController = require('famous/views/RenderController');
    var Keyhandling   = require('utils/Keyhandling');

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
              cursor: '-webkit-grab'
          },
      });

      var squareModifier = new StateModifier({
          size: [this.options.squareSize, this.options.squareSize],
          opacity: 1,
          origin: [0.5, 0.5],
          align: [0.5, 0.5]
      });

      var squareModifierChain = new ModifierChain();
      squareModifierChain.addModifier(squareModifier);


      draginator.subscribe(square);
      var renderController = new RenderController();
      renderController.show(square);
      Keyhandling.enableKeymovement(square, squareModifierChain, renderController);

      var node = this.add(squareModifierChain).add(draginator).add(renderController);

      square.on('dblclick', function() {
          square.setContent('click?');
          square.setProperties({
              textAlign: 'center'
          });
      }.bind(this));


      this.squares['square'+this.numSquares] = node;
    };

    WorkView.DEFAULT_OPTIONS = {
        squareSize: 50
    };

    module.exports = WorkView;
});