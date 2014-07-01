define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');

    var GridLayout    = require('famous/views/GridLayout');

    var Draggable     = require('famous/modifiers/Draggable');
    var StateModifier = require('famous/modifiers/StateModifier');

    var ToolView      = require('views/ToolView');

    function MenuView() {
        View.apply(this, arguments);

        var draggable = new Draggable();
        this.icons = ['□', '⿴', '❖', '⏍', '⍰'];
        this.iconNames = [
            'surface',
            'generate',
            'toggleFlexible',
            'imageSurface',
            'help'];
        this.tooltipsPos = [
            'hint--left',
            'hint--right',
            'hint--left',
            'hint--right',
            'hint--left'];
        this.tooltipsText = [
            'New surface',
            'Generate code: Fixed',
            'Generate code: Flexible',
            'New image surface',
            'Help'];
        this.options.rows = Math.ceil(this.icons.length/this.options.cols);

        _createToolMenu.call(this, draggable);
        _createButtons.call(this, draggable);
    }

    MenuView.prototype = Object.create(View.prototype);
    MenuView.prototype.constructor = MenuView;

    MenuView.DEFAULT_OPTIONS = {
        topOffset: 50,
        cols: 2,
        spacing: 62.5,
        padding: 25
    };

    function _createToolMenu(draggable) {
        this.toolMenu = new Surface({
            size: [this.options.cols * this.options.spacing + this.options.padding,
                   this.options.rows * this.options.spacing + this.options.padding],
            properties: {
                backgroundColor: '#FFFFF5',
                zIndex: 1,
                boxShadow: '5px 5px 15px rgba(50, 50, 50, .5)',
                height: this.options.topOffset
            }
        });

        this.toolMenuModifier = new StateModifier({
            opacity: 0.25,
            transform: Transform.translate(0, 0, 1)
        });

        draggable.subscribe(this.toolMenu);

        this.add(this.toolMenuModifier)
            .add(draggable)
            .add(this.toolMenu);
    }

    function _createButtons(draggable) {
        var grid = new GridLayout({
            dimensions: [this.options.cols, this.options.rows],
            // gutterSize: [5, 5]
            gutterSize: [15, 15]
        });

        var tools = [];
        grid.sequenceFrom(tools);

        var menuEvent = function() {
            this.menu.current = this.content;
            this.menu._eventOutput.emit('menu');
        };

        for (var i = 0; i < this.icons.length; i++) {
            var toolView = new ToolView();
            toolView.tool.setOptions({
                content: this.icons[i],
                classes: [this.tooltipsPos[i], this.iconNames[i]],
                properties: {
                    backgroundColor: 'pink',
                    lineHeight: '60px',
                    textAlign: 'center',
                    fontSize: '40px',
                    cursor: 'pointer'
                }
            });

            toolView.tool.menu = this;

            toolView.tool.on('click', menuEvent);

            tools.push(toolView.tool);
        }

        var gridModifier = new StateModifier({
            size: [this.options.spacing * this.options.cols,
                   this.options.spacing * this.options.rows],
            origin: [0.5, 0],
            align: [0.5, 0.12],
            transform: Transform.translate(0, 0, 1),
            properties: {
                zIndex: 1
            }
        });

        draggable.subscribe(grid);

        this.add(draggable).add(gridModifier).add(grid);
    }

    module.exports = MenuView;
});
