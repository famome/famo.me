define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    function LayoutElementView() {
        View.apply(this, arguments);

        var surface = new Surface();
        surface.properties = {
            backgroundColor: 'pink'
        }

        this.surface = surface;


        window.le = this;
        this.add(surface);
        requestAnimationFrame(function() { surface._currTarget.onmousemove = _onMouseMove.bind(this) });
    }

    LayoutElementView.prototype = Object.create(View.prototype);
    LayoutElementView.prototype.constructor = LayoutElementView;

    LayoutElementView.DEFAULT_OPTIONS = {};

    function _onMouseMove (event) {
        console.log(event.target);
    };

    module.exports = LayoutElementView;
});
