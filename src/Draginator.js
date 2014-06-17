define(function(require, exports, module) {
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var EventHandler = require('famous/core/EventHandler');
    var Utilities = require('famous/math/Utilities');

    var Draggable = require('famous/modifiers/Draggable')

    var Draginator = function(){
        Draggable.call(this);

        this._active = {
            "draggable": true,
            "resizeable": false,
            "rotateable": false
        };
    }

    Draginator.prototype.constructor = Draginator;
    Draginator.prototype = Object.create(Draggable.prototype);

    /**
     * Helper function that returns true if there exists a propery in obj that is true
     *
     * @method activate
     *
     * @param {object} object to check if any properties
     *      Will deactivate other types of actions
     *
     * @return {boolean} true if there exists a property in obj that is true
     */
    function hasTrueProperty(obj) {
        for (var key in obj) {
            if (obj[key]) return true;
        }

        return false;
    }

    function _handleStart() {
        if (!hasTrueProperty(this._active)) return;
        if (this._positionState.isActive()) this._positionState.halt();
        this.eventOutput.emit('start', {position : this.getPosition()});
    }

    function _handleMove(event) {
        if (!hasTrueProperty(this._active)) return;

        var options = this.options;
        this._differential = event.position;
        var newDifferential = _mapDifferential.call(this, this._differential);

        //buffer the differential if snapping is set
        this._differential[0] -= newDifferential[0];
        this._differential[1] -= newDifferential[1];

        var pos = this.getPosition();

        //modify position, retain reference
        pos[0] += newDifferential[0];
        pos[1] += newDifferential[1];

        //handle bounding box
        if (options.xRange){
            var xRange = [options.xRange[0] + 0.5 * options.snapX, options.xRange[1] - 0.5 * options.snapX];
            pos[0] = _clamp(pos[0], xRange);
        }

        if (options.yRange){
            var yRange = [options.yRange[0] + 0.5 * options.snapY, options.yRange[1] - 0.5 * options.snapY];
            pos[1] = _clamp(pos[1], yRange);
        }

        this.eventOutput.emit('update', {position : pos});
    }

    function _handleEnd() {
        if (!hasTrueProperty(this._active)) return;
        this.eventOutput.emit('end', {position : this.getPosition()});
    }

    /**
     * Set this draginator to respond to user input for the particular types of actions passed.
     *
     * @method activate
     *
     * @param {string} type of action to activate [e.g., "drag", "resize", etc.]
     *      Will deactivate other types of actions
     */
    Draginator.prototype.activate = function activate(type) {
        for (var key in this._active) this.deactivate(key);
        this._active[type] = true;
    };

    /**
     * Set this draggable to ignore user input.
     *
     * @method deactivate
     *
     * @param {string} type of action to deactivate
     */
    Draggable.prototype.deactivate = function deactivate(type) {
        this._active[type] = false;
    };

    /**
     * Return render spec for this Modifier, applying to the provided
     *    target component.  This is similar to render() for Surfaces.
     *
     * @private
     * @method modify
     *
     * @param {Object} target (already rendered) render spec to
     *    which to apply the transform.
     * @return {Object} render spec for this Modifier, including the
     *    provided target
     */
    Draginator.prototype.modify = function modify(target) {
        var pos = this.getPosition();
        var transform;

        if (this._active["draggable"])
            transform = Transform.translate(pos[0], pos[1]);
        else if (this._active["resizeable"])
            transform = Transform.scale(pos[0]/100 || .001, pos[2]/100 || .001)
        else if (this._active["rotateable"])
            // Fix me Fix me Fix me
            transform = Transform.identity();
        else
            return false;

        return {
            transform: transform,
            target: target
        };
    };

    module.exports = Draginator;
});
