define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var GridLayout    = require('famous/views/GridLayout');
    var RenderNode    = require('famous/core/RenderNode');
    var Draggable     = require('famous/modifiers/Draggable');

    var ToolView      = require('views/ToolView');

    function MenuView() {
        View.apply(this, arguments);

        var draggable = new Draggable();

        _createToolMenu.call(this, draggable);
        _createButtons.call(this, draggable);
    }

    MenuView.prototype = Object.create(View.prototype);
    MenuView.prototype.constructor = MenuView;

    MenuView.DEFAULT_OPTIONS = {
        topOffset: 50
    };

    function _createToolMenu(draggable) {
        this.toolMenu = new Surface({
            size: [this.options.menuSize, undefined],
            origin: [0.5, 0],
            align: [0.5, 0],
            properties: {
                backgroundColor: '#FFFFF5',
                zIndex: 1,
                boxShadow: "5px 5px 15px rgba(50, 50, 50, .5)",
                height: this.options.topOffset
            }
        });

        this.toolMenuModifier = new StateModifier({
            opacity: 0.25,
            transform: Transform.translate(0, 0, 1)
        });

        draggable.subscribe(this.toolMenu);

        this.add(this.toolMenuModifier).add(draggable).add(this.toolMenu);
    }

    function _createButtons(draggable) {
        var grid = new GridLayout({
            dimensions: [2, 2],
            gutterSize: [5, 5]
        });

        var tools = [];
        grid.sequenceFrom(tools);
        var icons = ['⬒', '⬓', '⿳', '⿲'];

        for (var i = 0; i < 4; i++) {
            var toolView = new ToolView();
            toolView.tool.setOptions({
                content: icons[i],
                size: [undefined, undefined],
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                properties: {
                    backgroundColor: 'pink',
                    lineHeight: '60px',
                    textAlign: 'center',
                    fontSize: 40 + 'px',
                    cursor: 'pointer'
                }
            });

            toolView.tool.menu = this;

            toolView.tool.on('click', function() {
                this.menu.current = this.content;
                this.menu._eventOutput.emit('menu');
            });

            tools.push(toolView.tool);
        }


        var gridModifier = new StateModifier({
            size: [125, 125],
            origin: [.5, .25],
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
