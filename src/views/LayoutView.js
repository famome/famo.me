define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var EventHandler  = require('famous/core/EventHandler');
    var Draginator    = require('Draginator');
    var RenderController = require('famous/views/RenderController');
    var Transitionable = require('famous/transitions/Transitionable');

    function LayoutView() {
        View.apply(this, arguments);

        this.id = 'LayoutView';
        this.dimension = this.options.dimension; // Grid Units, based off protoSize
        this.xOffset = this.options.offset[0]; // Grid Units
        this.yOffset = this.options.offset[1]; // Grid Units
        this.width = this.options.size.width; // PX
        this.height = this.options.size.height; // PX
        this.snapX = this.options.snapX; // PX
        this.snapY = this.options.snapY; // PX

        _createLayoutDraginator.call(this);
        _createLayoutModifier.call(this);
        _createLayoutSurface.call(this);

        _setListeners.call(this);

        this.add(this.draginator).add(this.modifier).add(this.renderController);
        this.draginator.setPosition([this.options.protoSize.width * this.xOffset,
            this.options.protoSize.height * this.yOffset]);
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
        this.layouts[this.id] = {
            // ALERT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Change to store pixels
            offset: [this.xOffset * this.options.protoSize.width, this.yOffset * this.options.protoSize.height],
            // offset: [this.xOffset, this.yOffset],
            // ALERT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            size: [this.width, this.height]
        };
        this.layoutsList.push(this);
    };
    LayoutView.prototype.linkTo = function(layouts, layoutsList, numLayouts) {
        this.layouts = layouts;
        this.numLayouts = numLayouts;
        this.layoutsList = layoutsList;

        this.id += this.numLayouts;
        console.log('numLayouts', this.numLayouts);
        console.log('layoutsList', this.layoutsList);
        console.log('layouts', JSON.stringify(this.layouts));
    };
    LayoutView.prototype.removeLayout = function() {
        var index = this.layoutsList.indexOf(this);
        this._eventOutput.emit('cycleToNextLayout', index);
        this.layoutsList.splice(index, 1);
        delete this.layouts[this.id];
    };
    LayoutView.prototype.getLayouts = function() {
        return this.layouts;
    };

    LayoutView.prototype.selectSurface = function() {
        console.log('selectSurface ', this);
        this.surface.setProperties({
            backgroundColor: 'pink',
            zIndex: 100
        });
        this.draginator.select();
    };

    LayoutView.DEFAULT_OPTIONS = {
        // snapX: 60,
        // snapY: 60,
        snapX: 1,
        snapY: 1,
        offset: [0, 0],
        dimension: [1, 1],
        color: 'pink',
        size: {
            width: 60,
            height: 60
        },
        protoSize: {
            width: 60,
            height: 60
        },
        screen: {
            width: 960,
            height: 600
        },
        edgeDetectSize: 20,
        zIndex: 9
    };

    function _createLayoutDraginator() {
        this.draginator = new Draginator({
            snapX: this.snapX,
            snapY: this.snapY,
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
                cursor: '-webkit-grab'
            }
        });
        this.renderController = new RenderController();
        this.renderController.show(this.surface);
    }

    function _setEdges(event) {
        this.surface.setProperties({mouseInside: true});
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

        if (event.offsetY < this.options.edgeDetectSize)
            edge = 'n';
        if (this.height - event.offsetY < this.options.edgeDetectSize)
            edge = 's';
        if (event.offsetX < this.options.edgeDetectSize)
            edge += 'w';
        if (this.width - event.offsetX < this.options.edgeDetectSize)
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
            if (this.layouts[this.id]) {
                console.log('translating');
                this.xOffset += data[0];
                this.yOffset += data[1];

                this.layouts[this.id].offset = [this.xOffset, this.yOffset];
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
            console.log('resizing');
            var cursor = this.surface.properties.cursor;
            var currentSize = this.modifier.getSize();
            var currentDimension = this.dimension;

            if ((currentSize[0] + data[0] * this.snapX) // make sure box doesn't shrink to 0 width
                && (currentSize[1] + data[1] * this.snapY) // make sure box doesn't shrink to 0 height
                // Make sure right/bottom doesn't go past grid boundaries
                && (this.xOffset * this.options.box.width + currentSize[0] + data[0] * this.snapX <= this.options.screen.width)
                && (this.yOffset * this.options.box.height + currentSize[1] + data[1] * this.snapY <= this.options.screen.height)) {
                // ALERT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                this.dimension[0] = currentDimension[0] + data[0];
                this.dimension[1] = currentDimension[1] + data[1];

                this.modifier.setSize(
                    [currentSize[0] + data[0] * this.snapX,
                    currentSize[1] + data[1] * this.snapY]);

                this.draginator.options.xRange[1] -= data[0] * this.snapX;
                this.draginator.options.yRange[1] -= data[1] * this.snapY;

                this.layouts[this.id].size = [
                    currentSize[0] + data[0] * this.options.snapX,
                    currentSize[1] + data[1] * this.snapY
                ];
            }
        }.bind(this));

        this.surface.on('dblclick', function() {
            console.log(this.id, this.getLayouts()[this.id]);
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
                console.log('going to selectSurface ', this);
                this.selectSurface.call(this);
            }
        }.bind(this));

        this._eventInput.on('deselect', function() {
                this.surface.setProperties({
                    boxShadow: 'none',
                    backgroundColor: 'pink',
                    zIndex: 9
                })
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
