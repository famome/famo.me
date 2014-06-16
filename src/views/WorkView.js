define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var ModifierChain = require('famous/modifiers/ModifierChain');
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

      var squareModifierChain = new ModifierChain();
      squareModifierChain.addModifier(squareModifier);

      _enableKeymovement(square, squareModifierChain);

      draggable.subscribe(square);
      var node = this.add(squareModifierChain).add(draggable).add(square);
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

    var moveElement;

    function _enableKeymovement(currentSurf, currentMod) {
        console.log('enabling key movement for surface', currentSurf, 'and modifier', currentMod);
        var keyListener = function(currentMod) {
            var rx = 0;
            var ry = 0;
            var rz = 0;
            var sx;
            var sy;
            var sz;
            var tx;
            var ty;
            var tz;

            var moveUp = function(event) {
                var options;

                if (event.shiftKey) {
                    options = { transform: Transform.translate(tx, ty - 5, tz) };
                } else if (event.metaKey) {
                    options = { transform: Transform.scale(sx, sy - 1, sz) };
                } else if (event.altKey) {
                    options = { transform: Transform.rotateZ(tz - .01) };
                } else if (event.altKey && event.shiftKey) {
                    options = { transform: Transform.rotateZ(tz - .05) };
                } else {
                    options = { transform: Transform.translate(tx, ty - 1, tz) };
                }

                var newTransform = new StateModifier(options);
                currentMod.addModifier(newTransform);
            };

            var moveDown = function(event) {
                var options;

                if (event.shiftKey) {
                    options = { transform: Transform.translate(tx, ty + 5, tz) };
                } else if (event.metaKey) {
                    options = { transform: Transform.scale(sx, sy + 1, sz) };
                } else if (event.altKey) {
                    options = { transform: Transform.rotateZ(tz + .01) };
                } else if (event.altKey && event.shiftKey) {
                    options = { transform: Transform.rotateZ(tz + .05) };
                } else {
                    options = { transform: Transform.translate(tx, ty + 1, tz) };
                }

                var newTransform = new StateModifier(options);
                currentMod.addModifier(newTransform);
            };

            var moveLeft = function(event) {
                var options;

                if (event.shiftKey) {
                    options = { transform: Transform.translate(tx - 5, ty, tz) };
                } else if (event.metaKey) {
                    options = { transform: Transform.scale(sx - 1, sy, sz) };
                } else if (event.altKey) {
                    options = { transform: Transform.rotateY(ty - .01) };
                } else if (event.altKey && event.shiftKey) {
                    options = { transform: Transform.rotateY(ty - .05) };
                } else {
                    options = { transform: Transform.translate(tx - 1, ty, tz) };
                }

                var newTransform = new StateModifier(options);
                currentMod.addModifier(newTransform);
            };

            var moveRight = function(event) {
                var options;

                if (event.shiftKey) {
                    options = { transform: Transform.translate(tx + 5, ty, tz) };
                } else if (event.metaKey) {
                    options = { transform: Transform.scale(sx + 1, sy, sz) };
                } else if (event.altKey) {
                    options = { transform: Transform.rotateY(ty + .01) };
                } else if (event.altKey && event.shiftKey) {
                    options = { transform: Transform.rotateY(ty + .05) };
                } else {
                    options = { transform: Transform.translate(tx + 1, ty, tz) };
                }

                var newTransform = new StateModifier(options);
                currentMod.addModifier(newTransform);
            };

            var move = {
                "Up": moveUp,
                "Down": moveDown,
                "Left": moveLeft,
                "Right": moveRight
            };

            window.onkeydown = function(event) {
                //moveElement(event);
                var direction = event.keyIdentifier;
                sx = currentMod._chain[0]._transformState._final[0];
                sy = currentMod._chain[0]._transformState._final[5];
                sz = currentMod._chain[0]._transformState._final[10];
                tx = currentMod._chain[0]._transformState._final[12];
                ty = currentMod._chain[0]._transformState._final[13];
                tz = currentMod._chain[0]._transformState._final[14];
                move[direction](event);
            };
        };

        var keySilencer = function() {
            window.removeEventListener('onkeydown', moveElement);
        };

        currentSurf.on('click', function(event) {
            keySilencer();
            keyListener(currentMod);
        });

    }
});
