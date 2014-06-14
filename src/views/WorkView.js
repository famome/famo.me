define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
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

      _enableKeymovement(square, squareModifier);

      draggable.subscribe(square);
      var node = this.add(squareModifier).add(draggable).add(square);
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
        var keyListener = function(currentMod) {
            var x = currentMod._transformState._final[12];
            var y = currentMod._transformState._final[13];

            var moveElement = function(event) {
                if (event.keyIdentifier === "Right") {
                    if (event.shiftKey) {
                    x = x + 5;
                    } else {
                        x++;
                    }
                    currentMod.setTransform(Transform.translate(x, y, 0));
                } else if (event.keyIdentifier === "Down") {
                    if (event.shiftKey) {
                        y = y + 5;
                    } else {
                        y++;
                    }
                    currentMod.setTransform(Transform.translate(x, y, 0));
                } else if (event.keyIdentifier === "Left") {
                    if (event.shiftKey) {
                        x = x - 5;
                    } else {
                        x--;
                    }
                    currentMod.setTransform(Transform.translate(x, y, 0));
                } else if (event.keyIdentifier === "Up") {
                    if (event.shiftKey) {
                        y = y - 5;
                    } else {
                        y--;
                    }
                    currentMod.setTransform(Transform.translate(x, y, 0));
                }
            };

            window.onkeydown = function(event) {
                moveElement(event);
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
