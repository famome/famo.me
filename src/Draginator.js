/*             
 * , . ..           
 * ,      ://.//./.
 *
 * : @.
 * @  .
 * @  , . 
 */

define(function(require, exports, module) {
    var Transform = require('famous/core/Transform');
    var Transitionable = require('famous/transitions/Transitionable');
    var EventHandler = require('famous/core/EventHandler');
    var Utilities = require('famous/math/Utilities');

    var GenericSync = require('famous/inputs/GenericSync');
    var MouseSync = require('famous/inputs/MouseSync');
    var TouchSync = require('famous/inputs/TouchSync');
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});

    var keyMatrix = {
        up: [0, -10],
        down: [0, 10],
        left: [-10, 0],
        right: [10, 0]
    }

    /**
     * Makes added render nodes responsive to drag beahvior.
     *   Emits events 'start', 'update', 'end'.
     * @class Draginator
     * @constructor
     * @param {Object} [options] options configuration object.
     * @param {Number} [options.snapX] grid width for snapping during drag
     * @param {Number} [options.snapY] grid height for snapping during drag
     * @param {Array.Number} [options.xRange] maxmimum [negative, positive] x displacement from start of drag
     * @param {Array.Number} [options.yRange] maxmimum [negative, positive] y displacement from start of drag
     * @param {Number} [options.scale] one pixel of input motion translates to this many pixels of output drag motion
     * @param {Number} [options.projection] User should set to Draginator._direction.x or
     *    Draginator._direction.y to constrain to one axis.
     *
     */
    function Draginator(options) {
        this.options = Object.create(Draginator.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);

        this._positionState = new Transitionable([0,0]);
        this._differential  = [0,0];
        this._active = true,

        this.sync = new GenericSync(['mouse', 'touch'], {scale : this.options.scale});
        this.eventOutput = new EventHandler();
        EventHandler.setInputHandler(this,  this.sync);
        EventHandler.setOutputHandler(this, this.eventOutput);

        _bindEvents.call(this);
    }


    //binary representation of directions for bitwise operations
    var _direction = {
        x : 0x01,         //001
        y : 0x02          //010
    };

    Draginator.DIRECTION_X = _direction.x;
    Draginator.DIRECTION_Y = _direction.y;

    var _clamp = Utilities.clamp;

    Draginator.DEFAULT_OPTIONS = {
        projection  : _direction.x | _direction.y,
        scale       : 1,
        xRange      : null,
        yRange      : null,
        snapX       : 0,
        snapY       : 0,
        transition  : {duration : 0}
    };

    function _mapDifferential(differential) {
        var opts        = this.options;
        var projection  = opts.projection;
        var snapX       = opts.snapX;
        var snapY       = opts.snapY;

        //axes
        var tx = (projection & _direction.x) ? differential[0] : 0;
        var ty = (projection & _direction.y) ? differential[1] : 0;

        //snapping
        if (snapX > 0) tx -= tx % snapX;
        if (snapY > 0) ty -= ty % snapY;

        return [tx, ty];
    }

    function _handleStart() {
        if (!this._active) return;
        if (this._positionState.isActive()) this._positionState.halt();
        this.eventOutput.emit('start', {position : this.getPosition()});
    }

    function _handleMove(event) {
        if (!this._active) return;

        var options = this.options;
        this._differential = event.position;
        var newDifferential = _mapDifferential.call(this, this._differential);

        //find the cols and rows offest...
        var gridDifferential = [
            newDifferential[0] / this.options.snapX,
            newDifferential[1] / this.options.snapY
        ];

        //pipe that
        this.eventOutput.emit('updateGridCoordinates', gridDifferential);
        this.eventOutput.emit('resize', gridDifferential);

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

    function _handleKeyMove(event) {
        console.log('^-^ ', event.keyIdentifier);
        if (!this._active) return;

        this._differential = keyMatrix[event.charCode];
        this.newDifferential[0] = this._differential[0];
        this.newDifferential[1] = this._differential[1];

        var pos = this.getPosition();

        //modify position, retain reference
        pos[0] += newDifferential[0];
        pos[1] += newDifferential[1];

        this.eventOutput.emit('update', {position : pos});
    }

    function _handleEnd() {
        if (!this._active) return;
        this.eventOutput.emit('end', {position : this.getPosition()});
    }

    function _bindEvents() {
        this.sync.on('start', _handleStart.bind(this));
        this.sync.on('update', _handleMove.bind(this));
        this.sync.on('end', _handleEnd.bind(this));
        this.on('keypress', _handleKeyMove.bind(this));
    }

    /**
     * Set internal options, overriding any default options
     *
     * @method setOptions
     *
     * @param {Object} [options] overrides of default options.  See constructor.
     */
    Draginator.prototype.setOptions = function setOptions(options) {
        var currentOptions = this.options;
        if (options.projection !== undefined) {
            var proj = options.projection;
            this.options.projection = 0;
            ['x', 'y'].forEach(function(val) {
                if (proj.indexOf(val) !== -1) currentOptions.projection |= _direction[val];
            });
        }
        if (options.scale  !== undefined) {
            currentOptions.scale  = options.scale;
            this.sync.setOptions({
                scale: options.scale
            });
        }
        if (options.xRange !== undefined) currentOptions.xRange = options.xRange;
        if (options.yRange !== undefined) currentOptions.yRange = options.yRange;
        if (options.snapX  !== undefined) currentOptions.snapX  = options.snapX;
        if (options.snapY  !== undefined) currentOptions.snapY  = options.snapY;
    };

    /**
     * Get current delta in position from where this draginator started.
     *
     * @method getPosition
     *
     * @return {array<number>} [x, y] position delta from start.
     */
    Draginator.prototype.getPosition = function getPosition() {
        return this._positionState.get();
    };

    /**
     * Transition the element to the desired relative position via provided transition.
     *  For example, calling this with [0,0] will not change the position.
     *  Callback will be executed on completion.
     *
     * @method setRelativePosition
     *
     * @param {array<number>} position end state to which we interpolate
     * @param {transition} transition transition object specifying how object moves to new position
     * @param {function} callback zero-argument function to call on observed completion
     */
    Draginator.prototype.setRelativePosition = function setRelativePosition(position, transition, callback) {
        var currPos = this.getPosition();
        var relativePosition = [currPos[0] + position[0], currPos[1] + position[1]];
        this.setPosition(relativePosition, transition, callback);
    };

    /**
     * Transition the element to the desired absolute position via provided transition.
     *  Callback will be executed on completion.
     *
     * @method setPosition
     *
     * @param {array<number>} position end state to which we interpolate
     * @param {transition} transition transition object specifying how object moves to new position
     * @param {function} callback zero-argument function to call on observed completion
     */
    Draginator.prototype.setPosition = function setPosition(position, transition, callback) {
        if (this._positionState.isActive()) this._positionState.halt();
        this._positionState.set(position, transition, callback);
    };

    /**
     * Set this draginator to respond to user input for the particular types of actions passed.
     *
     * @method activate
     *
     * @param {string} type of action to activate [e.g., "drag", "resize", etc.]
     *      Will deactivate other types of actions
     */
    Draginator.prototype.activate = function activate(type) {
        this._active = true;
    };

    /**
     * Set this draginator to ignore user input.
     *
     * @method deactivate
     *
     * @param {string} type of action to deactivate
     */
    Draginator.prototype.deactivate = function deactivate(type) {
        this._activetype = false;
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

        if (this._active)
            transform = Transform.translate(pos[0], pos[1]);
        else
            return false;

        return {
            transform: transform,
            target: target
        };
    };

    module.exports = Draginator;
});
