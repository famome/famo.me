define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var EventHandler  = require('famous/core/EventHandler');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draginator    = require('Draginator');
    var BasicLayout   = require('utils/BasicLayout');
    var LayoutView    = require('views/LayoutView');
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
      var layoutView = new LayoutView();
      
      this.add(layoutView);
      
      this.layoutViews['layoutView' + this.numLayoutViews] = layoutView;
    };

    WorkView.DEFAULT_OPTIONS = {};

    module.exports = WorkView;
});