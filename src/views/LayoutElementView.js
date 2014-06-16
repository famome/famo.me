define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    function LayoutElementView() {
        View.apply(this, arguments);
    }

    LayoutElementView.prototype = Object.create(View.prototype);
    LayoutElementView.prototype.constructor = LayoutElementView;

    LayoutElementView.DEFAULT_OPTIONS = {};

    module.exports = LayoutElementView;
});
