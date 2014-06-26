define(function(require, exports, module) {
    var EventHandler     = require('famous/core/EventHandler');
    var Transform        = require('famous/core/Transform');
    var Surface          = require('famous/core/Surface');
    var View             = require('famous/core/View');

    var RenderController = require('famous/views/RenderController');

    var StateModifier    = require('famous/modifiers/StateModifier');

    var Transitionable   = require('famous/transitions/Transitionable');


    var Draginator       = require('Draginator');

    function LayoutView() {
        View.apply(this, arguments);

        this.id = 'LayoutView';
        this.xOffset = this.options.offset[0] * this.options.size.width; // PX
        this.yOffset = this.options.offset[1] * this.options.size.height; // PX

        _createLayoutDraginator.call(this);
        _createLayoutModifier.call(this);
        _createLayoutSurface.call(this);

        _setListeners.call(this);

        this.add(this.draginator).add(this.modifier).add(this.renderController);
        this.draginator.setPosition([this.xOffset, this.yOffset]);
    }

    LayoutView.prototype = Object.create(View.prototype);
    LayoutView.prototype.constructor = LayoutView;

    LayoutView.prototype.getId = function() {
        return this.id;
    };

    LayoutView.prototype.getOffset = function() {
        return [this.xOffset, this.yOffset];
    };

    LayoutView.prototype.getSize = function() {
        return [this.width, this.height];
    };

    LayoutView.prototype.addLayout = function() {
        this.layoutsList.push(this);
    };

    LayoutView.prototype.linkTo = function(layoutsList, numLayouts) {
        this.numLayouts = numLayouts;
        this.layoutsList = layoutsList;
        this.id += this.numLayouts;
    };

    LayoutView.prototype.removeLayout = function() {
        var index = this.layoutsList.indexOf(this);

        this._eventOutput.emit('cycleToNextLayout', index);
        this.layoutsList.splice(index, 1);
    };

    LayoutView.prototype.selectSurface = function() {
        this.surface.setProperties({
            boxShadow: 'inset 0 0 1px rgba(0, 0, 0, 0.5)',
            backgroundColor: '#1496CC',
            zIndex: 100
        });
        this.draginator.select();
    };

    LayoutView.DEFAULT_OPTIONS = {
        offset: [0, 0],
        color: 'pink',
        size: {
            width: 60,
            height: 60
        },
        screen: {
            width: 960,
            height: 600
        },
        edgeDetectSize: {
            right: 20,
            bottom: 20
        },
        zIndex: 9
    };

    function _createLayoutDraginator() {
        this.draginator = new Draginator({
            snapX: this.options.size.width,
            snapY: this.options.size.height,
            minSnapX: 1,
            minSnapY: 1,
            maxSnapX: this.options.size.width,
            maxSnapY: this.options.size.height,
            xRange: [0, this.options.screen.width - this.options.size.width],
            yRange: [0, this.options.screen.height - this.options.size.height]
        });
    }

    function _createLayoutModifier() {
        this.modifier = new StateModifier({
            size: [this.options.size.width, this.options.size.height]
        });
    }

    function _createLayoutSurface() {
        this.surface = new Surface({
            properties: {
                backgroundColor: this.options.color,
                boxShadow: '0 0 10px black',
                cursor: '-webkit-grab'
            }
        });
        this.renderController = new RenderController();
        this.renderController.show(this.surface);
    }

    function _setEdges(event) {
        this.surface.setProperties({mouseInside: true});
        var currentSize = this.modifier.getSize();
        var edge = '';
        var edges = {
          // 'n' : { cursor: 'ns-resize' },
          // 'nw': { cursor: 'nwse-resize' },
          // 'w' : { cursor: 'ew-resize' },
          // 'sw': { cursor: 'nesw-resize' },
          's' : { cursor: 'ns-resize' },
          'se': { cursor: 'nwse-resize' },
          'e' : { cursor: 'ew-resize' },
          // 'ne': { cursor: 'nesw-resize' },
          ''  : { cursor: '-webkit-grab' }
        };

        if (event.offsetY < this.options.edgeDetectSize.bottom)
            edge = 'n';
        if (currentSize[1] - event.offsetY < this.options.edgeDetectSize.bottom)
            edge = 's';
        if (event.offsetX < this.options.edgeDetectSize.right)
            edge += 'w';
        if (currentSize[0] - event.offsetX < this.options.edgeDetectSize.right)
            edge += 'e';

        this.draggable = edge === '';

        if (edges[edge] && !this.dragging)
            this.surface.setProperties(edges[edge]);
    }

    function _removeEdges(event) {
        this.surface.setProperties({cursor: '-webkit-grab'});
        if (this.surface.properties.mouseInside && !this.surface.properties.grabbed)
            this.surface.setProperties({mouseInside: false});
    }

    function _grab(event) {
        var cursor = this.surface.properties.cursor;

        this.dragging = true;
        if (this.draggable) {
            this.surface.setProperties({cursor: '-webkit-grabbing'});
        }
        if (cursor === 'nwse-resize' || cursor === 'ns-resize' || cursor === 'ew-resize') {
            this.draginator.startDragging();
        }
    };

    function _ungrab(event) {
        this.dragging = false;
        if (this.draggable)
            this.surface.setProperties({cursor: '-webkit-grab'});
    }

    function _setListeners() {
        // initialize eventing linkages
        this.modifier.eventHandler = new EventHandler();
        this.modifier.eventHandler.pipe(this._eventInput);
        this.draginator.eventOutput.pipe(this._eventInput);
        this.surface.pipe(this);
        this._eventInput.pipe(this.draginator);

        // view listens for translate from draggable
        this._eventInput.on('translate', function(data){
            if (this.layoutsList[this.layoutsList.indexOf(this)]) {
                this.xOffset = data[0];
                this.yOffset = data[1];
            }
        }.bind(this));

        this._eventInput.on('mousemove', _setEdges.bind(this));
        this._eventInput.on('mouseenter', _setEdges.bind(this));
        this._eventInput.on('mouseleave', _removeEdges.bind(this));
        this.draginator.eventOutput.on('start', _grab.bind(this));
        this.draginator.eventOutput.on('update', function() {
            if (this.draginator.keybinding) {
                return _ungrab.call(this);
            } else {
                return _grab.call(this);
            }
        }.bind(this));
        this.draginator.eventOutput.on('end', _ungrab.bind(this));

        // view listens for resize from draggable
        this._eventInput.on('resize', function(data) {
            var cursor = this.surface.properties.cursor;
            var currentSize = this.modifier.getSize();

            if ((currentSize[0] + data[0]) // make sure box doesn't shrink to 0 width
                && (currentSize[1] + data[1]) // make sure box doesn't shrink to 0 height
                // Make sure right/bottom doesn't go past grid boundaries
                && (this.xOffset + currentSize[0] + data[0] <= this.options.screen.width)
                && (this.yOffset + currentSize[1] + data[1] <= this.options.screen.height)) {

                this.modifier.setSize(
                    [currentSize[0] + data[0], currentSize[1] + data[1]]);

                this.draginator.options.xRange[1] -= data[0];
                this.draginator.options.yRange[1] -= data[1];

            }
        }.bind(this));

        this.surface.on('dblclick', function() {
            console.log(this.id, this.layoutsList[this.layoutsList.indexOf(this)]);
        }.bind(this));

        this._eventInput.on('delete', function() {
            this.renderController.hide(this.surface);
            this.removeLayout();
            this._eventOutput.emit('allowCreation');
        }.bind(this));

        this._eventInput.on('create', function() {
            this._eventOutput.emit('createNewLayout');
        }.bind(this));

        this.surface.draginator = this.draginator;

        this._eventInput.on('switch', function() {
            this._eventOutput.emit('cycleToNextLayout', this.layoutsList.indexOf(this));
        }.bind(this));

        this._eventInput.on('select', function(selectedView) {
            if(this === selectedView) {
                this.selectSurface.call(this);
            }
        }.bind(this));

        this._eventInput.on('deselect', function() {
            this.surface.setProperties({
                boxShadow: 'inset 0 0 1px rgba(0, 0, 0, 0.5)',
                backgroundColor: 'pink',
                zIndex: 9
            });

            this.modifier.setTransform(this.modifier.getTransform());
            this.draginator.deselect();
        }.bind(this));

        this.surface.on('click', function() {
            this._eventOutput.emit('deselectRest', this);
            this.draginator.select();
            this.selectSurface.call(this);
        }.bind(this));
    }

    module.exports = LayoutView;
});
