define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable     = require('famous/modifiers/Draggable');
    var RenderController = require('famous/views/RenderController');

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


      draggable.subscribe(square);
      var renderController = new RenderController();
      renderController.show(square);
      _enableKeymovement(square, squareModifierChain, renderController);

      var node = this.add(squareModifierChain).add(draggable).add(renderController);
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

    function _enableKeymovement(currentSurf, currentMod, currentRenderController) {
        console.log('enabling key movement for surface', currentSurf, 'and modifier', currentMod);
        var keyListener = function(currentMod) {
            var rx = 0;
            var ry = 0;
            var rz = 0;
            var sx = 1;
            var sy = 1;
            var sz = 1;
            var tx;
            var ty;
            var tz;
            var currentState = 'translate';
            var bigPixelMod = 10;
            var smallPixelMod = 1;
            var bigScaleMod = 0.1;
            var smallScaleMod = 0.01;
            var bigAngleMod = Math.PI / 360 * 5;
            var smallAngleMod = Math.PI / 360;

            var moveBase = function(event,
                transBaseAxis, transBaseSign, transZSign,
                scaleBaseAxis, scaleBaseSign, scaleZSign,
                rotBaseAxis, rotBaseSign, rotZSign) {
                var options;
                var txSelector = tySelector = 0;
                var sxSelector = sySelector = 0;
                var rxSelector = rySelector = 0;
                var tSign = tZSign = sSign = sZSign = rSign = rZSign = 1;

                if (transBaseSign === '-') tSign = -1;
                if (transBaseAxis === 'x') {
                    txSelector = 1 * tSign;
                } else if (transBaseAxis === 'y') {
                    tySelector = 1 * tSign;
                }
                if (transZSign === '-') tZSign = -1;
                tzSelector = 1 * tZSign;

                if (scaleBaseSign === '-') sSign = -1;
                if (scaleBaseAxis === 'x') {
                    sxSelector = 1 * sSign;
                } else if (scaleBaseAxis === 'y') {
                    sySelector = 1 * sSign;
                }
                if (scaleZSign === '-') sZSign = -1;
                szSelector = 1 * sZSign;

                if (rotBaseSign === '-') rSign = -1;
                if (rotZSign === '-') rZSign = -1;
                rzSelector = 1 * rZSign;

                if (currentState === 'translate') {
                    if (event.altKey && event.shiftKey) {
                        options = {
                            transform: Transform.translate(tx, ty, tz + tzSelector * bigPixelMod)
                        };
                    } else if (event.altKey) {
                        options = {
                            transform: Transform.translate(tx, ty, tz + tzSelector * smallPixelMod)
                        };
                    } else if (event.shiftKey) {
                        options = {
                            transform: Transform.translate(
                                tx + txSelector * bigPixelMod,
                                ty + tySelector * bigPixelMod,
                                tz
                            )
                        };
                    } else {
                        options = {
                            transform: Transform.translate(
                                tx + txSelector * smallPixelMod,
                                ty + tySelector * smallPixelMod,
                                tz
                            )
                        };
                    }
                } else if (currentState === 'scale') {
                    if (event.altKey && event.shiftKey) {
                        console.log('fast translations!');
                        options = { transform: Transform.scale(sx, sy, sz + szSelector * bigScaleMod) };
                    } else if (event.altKey) {
                        options = { transform: Transform.scale(sx, sy, sz + szSelector * smallScaleMod) };
                    } else if (event.shiftKey) {
                        options = {
                            transform: Transform.scale(
                                sx + sxSelector * bigScaleMod,
                                sy + sySelector * bigScaleMod,
                                sz
                            )
                        };
                    } else {
                        options = {
                            transform: Transform.scale(
                                sx + sxSelector * smallScaleMod,
                                sy + sySelector * smallScaleMod,
                                sz
                            )
                        };
                    }
                } else if (currentState === 'rotate') {
                    if (event.altKey && event.shiftKey) {
                        options = { transform: Transform.rotateZ(rz + rZSign * bigAngleMod % Math.PI) };
                        console.log('fast z-rotations!', rz);
                    } else if (event.altKey) {
                        options = { transform: Transform.rotateZ(rz + rZSign * smallAngleMod % Math.PI) };
                        console.log('regular z-rotations!', rz);
                    } else if (event.shiftKey) {
                        if (rotBaseAxis === 'x') {
                            options = { transform: Transform.rotateX(rx + rSign * bigAngleMod % Math.PI) };
                        } else if (rotBaseAxis === 'y') {
                            options = { transform: Transform.rotateY(ry + rSign * bigAngleMod % Math.PI) };
                        }
                    } else {
                        if (rotBaseAxis === 'x') {
                            options = { transform: Transform.rotateX(rx + rSign * smallAngleMod % Math.PI) };
                        } else if (rotBaseAxis === 'y') {
                            options = { transform: Transform.rotateY(ry + rSign * smallAngleMod % Math.PI) };
                        }
                    }
                }
                console.log(options.transform.toString());
                var newTransform = new StateModifier(options);
                currentMod.addModifier(newTransform);
            }

            var moveUp = function(event) {
                moveBase(event, 'y', '-', '-', 'y', '+', '+', 'x', '-', '-');
            };

            var moveDown = function(event) {
                moveBase(event, 'y', '+', '+', 'y', '-', '-', 'x', '+', '+');
            };

            var moveLeft = function(event) {
                moveBase(event, 'x', '-', '-', 'x', '-', '-', 'y', '-', '-');
            };

            var moveRight = function(event) {
                moveBase(event, 'x', '+', '+', 'x', '+', '+', 'y', '+', '+');
            };


            var move = {
                "Up": moveUp,
                "Down": moveDown,
                "Left": moveLeft,
                "Right": moveRight
            };

            var enableTranslate = function() { currentState = 'translate'; };
            var enableRotate = function() { currentState = 'rotate'; };
            var enableScale = function() { currentState = 'scale'; };
            var deleteSurface = function() { console.log('deleting'); currentRenderController.hide(currentSurf); };

            var setState = {
                "U+0054": enableTranslate, // 't' for translate
                "U+0052": enableRotate, // 'r' for rotate
                "U+0053": enableScale, // 's' for scale
                "U+0044": deleteSurface // 'd' for delete
            }

            window.onkeydown = function(event) {
                //moveElement(event);
                console.log(event.keyIdentifier);
                var key = event.keyIdentifier;
                tx = currentMod._chain[0]._transformState._final[12];
                ty = currentMod._chain[0]._transformState._final[13];
                tz = currentMod._chain[0]._transformState._final[14];
                if (setState[key]) setState[key]();
                console.log(currentState);
                if (move[key]) move[key](event);
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
