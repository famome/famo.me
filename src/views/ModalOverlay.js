define(function(require, exports, module) {
    var View                = require('famous/core/View');
    var Surface             = require('famous/core/Surface');
    var Transform           = require('famous/core/Transform');
    var EventHandler        = require('famous/core/EventHandler');
    var OptionsManager      = require('famous/core/OptionsManager');

    var RenderController    = require('famous/views/RenderController');

    var ModifierChain       = require('famous/modifiers/ModifierChain');
    var StateModifier       = require('famous/modifiers/StateModifier');

    var MouseSync           = require('famous/inputs/MouseSync');
    var TouchSync           = require('famous/inputs/TouchSync');
    var GenericSync         = require('famous/inputs/GenericSync');

    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});

    function ModalOverlay() {
        View.apply(this, arguments);

        this.eventOutput = new EventHandler();
        this.sync = new GenericSync(['mouse', 'touch'], {scale : this.options.scale});
        EventHandler.setInputHandler(this,  this.sync);
        EventHandler.setOutputHandler(this, this.eventOutput);

        _createSurface.call(this);
        _setListeners.call(this);
    }

    ModalOverlay.prototype = Object.create(View.prototype);
    ModalOverlay.prototype.constructor = ModalOverlay;

    ModalOverlay.DEFAULT_OPTIONS = {
        center: [0.5, 0.5],
        color: 'rgba(0, 0, 0, .2)'
    };

    function _createSurface() {
        this.modifier = new StateModifier({
            transform: Transform.translate(0, 0, -2)
        });
        var renderController = new RenderController();
        this.surface = new Surface({
            size: [undefined, undefined],
            properties: {
                lineHeight: '150px',
                textAlign: 'center',
                backgroundColor: 'rgba(0, 0, 0, .75)',
                zIndex: -2
            }
        });
        // renderController.add(modifier).add(this.surface);
        this.modalNode = this.add(this.modifier);
        this.modalNode.add(this.surface);
    }

    function _setListeners() {
        // initialize eventing linkages
        this.eventHandler = new EventHandler();
        this.eventHandler.pipe(this._eventInput);

        // view listens for translate from draggable
        this._eventInput.on('showModal', function(data){
            var currentDimension = this.options.dimension;
            this.xOffset += data[0];
            this.yOffset += data[1];
        }.bind(this));

        this.surface.on('dblclick', function() {
            console.log('modal dblclick ', this.id, this.getLayoutsList().id);
        }.bind(this));
    }

    module.exports = ModalOverlay;
});
