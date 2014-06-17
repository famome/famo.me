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
        this.layoutViews = {};
        this.numLayoutViews = 0;

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

    WorkView.prototype.createLayoutView = function() {
      this.numLayoutViews++;
      console.log('creating layoutView', this.numLayoutViews);

      var draginator = new Draginator();

      var layoutView = new View({
          size: [this.options.layoutViewSize, this.options.layoutViewSize]
      });

      layoutView.surface = new Surface({
          size: [this.options.layoutViewSize, this.options.layoutViewSize],
          properties: {
              backgroundColor: 'pink',
              cursor: '-webkit-grab'
          },
      });
      layoutView.surface.pipe(layoutView);
      layoutView._eventInput.pipe(draginator);

      var viewNode = layoutView.add(layoutView.surface);

      var layoutViewModifier = new StateModifier({
          size: [this.options.layoutViewSize, this.options.layoutViewSize],
          opacity: 1,
          origin: [0.5, 0.5],
          align: [0.5, 0.5]
      });

      // draginator.subscribe(layoutView);

      var renderController = new RenderController();
      renderController.show(viewNode);
      Keyhandling.enableKeymovement(layoutView, layoutViewModifier, renderController);

      var node = this.add(layoutViewModifier).add(draginator).add(renderController);

      layoutView.on('dblclick', function() {
          layoutView.setContent('click?');
          layoutView.setProperties({
              textAlign: 'center'
          });
      }.bind(this));

      this.layoutViews['layoutView' + this.numLayoutViews] = node;
    };

    WorkView.DEFAULT_OPTIONS = {
        layoutViewSize: 50
    };

    module.exports = WorkView;
});