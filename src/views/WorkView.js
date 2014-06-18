define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draginator    = require('Draginator');
    var BasicLayout   = require('utils/BasicLayout');
    var RenderController = require('famous/views/RenderController');
    // var Keyhandling   = require('utils/Keyhandling');

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

      var draginator = new Draginator({
        // De-hardcode me!
        snapX: 100,
        snapY: 100
      });

      var layoutView = new View();
      layoutView.gridProperties = {
        offset: [0, 0],
        dimension: [1, 1]
      };

      layoutView.surface = new Surface({
          properties: {
              backgroundColor: 'pink',
              cursor: '-webkit-grab'
          },
      });
      layoutView.surface.pipe(layoutView);
      layoutView._eventInput.pipe(draginator);

      draginator.eventOutput.pipe(layoutView._eventInput);

// Handle these events in a helper utility!
      layoutView._eventInput.on('updateGridCoordinates', function(data){
        layoutView.gridProperties.offset[0] += data[0];
        layoutView.gridProperties.offset[1] += data[1];
      });

      layoutView._eventInput.on('emBiggen', function(data){
        layoutView.gridProperties.dimension[0] += data[0];
        layoutView.gridProperties.dimension[1] += data[1];
      });

      var layoutViewModifier = new StateModifier({
          size: [this.options.layoutViewSize, this.options.layoutViewSize]
      });

      layoutViewModifier.eventHandler = new EventHandler();
      draginator.eventOutput.pipe(layoutViewModifier.eventHandler);

      layoutViewModifier.eventHandler.pipe(layoutView._eventInput);

      // This should be in Draginator, with logic to direct flow depending on if we're
      //  resizing or moving
      // layoutViewModifier.eventHandler.on('resize', function(data) {
      //   this.emit('emBiggen', data);
      // });

// !ytilitu repleh a ni stneve eseht eldnaH

      // draginator.subscribe(layoutView);

      // var renderController = new RenderController();
      // renderController.show(viewNode);
      //Keyhandling.enableKeymovement(layoutView.surface, layoutViewModifier, renderController);
      // window.onkeydown = function(event) {
      //   console.log(this);
      // };

      layoutView.add(draginator).add(layoutViewModifier).add(layoutView.surface);
      this.add(layoutView);

      layoutView.on('dblclick', function() {
          layoutView.setContent('click?');
          layoutView.setProperties({
              textAlign: 'center'
          });
      }.bind(this));

      this.layoutViews['layoutView' + this.numLayoutViews] = layoutView;
    };

    WorkView.DEFAULT_OPTIONS = {
        layoutViewSize: 50
    };

    module.exports = WorkView;
});