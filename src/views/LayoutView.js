define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var EventHandler  = require('famous/core/EventHandler');
    var Draginator    = require('Draginator');

    function LayoutView() {
        View.apply(this, arguments);

        this.id = 'LayoutView';
        this.xOffset = 0;
        this.yOffset = 0;
        this.width = this.options.size.width;
        this.height = this.options.size.height;

        _createLayoutDraginator.call(this);
        _createLayoutModifier.call(this);
        _createLayoutSurface.call(this);

        _setListeners.call(this);

        this.add(this.draginator).add(this.modifier).add(this.surface);
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
            offset: [this.xOffset, this.yOffset],
            size: [this.width, this.height]
        };
    };
    LayoutView.prototype.linkTo = function(layouts, numLayouts) {
        this.layouts = layouts;
        this.numLayouts = numLayouts;

        this.id += ' ' + this.numLayouts;
    };
    LayoutView.prototype.removeLayout = function() {
        console.log('before',this.id, this.layouts[this.id]);
        delete this.layouts[this.id];
        console.log('after', this.layouts, this.layouts[this.id]);
    };
    LayoutView.prototype.getLayouts = function() {
        return this.layouts;
    };

    LayoutView.DEFAULT_OPTIONS = {
        snapX: 120,
        snapY: 120,
        offset: [0, 0],
        dimension: [1, 1],
        color: 'pink',
        size: {
            width: 120,
            height: 120
        },
        edgeDetectSize: 20,
        zIndex: 9
    };

    function _createLayoutDraginator() {
        this.draginator = new Draginator({
          snapX: this.options.snapX,
          snapY: this.options.snapY
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
                border: '0px solid purple',
                backgroundColor: this.options.color,
                cursor: '-webkit-grab'
            }
        });
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
        if (this.options.snapY * this.options.dimension[1] - event.offsetY < this.options.edgeDetectSize)
            edge = 's';
        if (event.offsetX < this.options.edgeDetectSize)
            edge += 'w';
        if (this.options.snapY * this.options.dimension[0] - event.offsetX < this.options.edgeDetectSize)
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
            console.log('translating');
            this.xOffset += data[0];
            this.yOffset += data[1];

            this.layouts[this.id].offset = [this.xOffset, this.yOffset];
        }.bind(this));

        this._eventInput.on('mousemove', _setEdges.bind(this));
        // this._eventInput.on('mouseleave', _removeEdges.bind(this));
        this.draginator.eventOutput.on('start', _grab.bind(this));
        this.draginator.eventOutput.on('update', _grab.bind(this));
        this.draginator.eventOutput.on('end', _ungrab.bind(this));

        // view listens for resize from draggable
        this._eventInput.on('resize', function(data) {
            console.log('resizing');
            var cursor = this.surface.properties.cursor;
            var currentSize = this.modifier.getSize();
            var currentDimension = this.options.dimension;

            if (this.dragging && (currentSize[0] + data[0] * this.options.snapX > 0)
                && (currentSize[1] + data[1] * this.options.snapY)) {
                this.options.dimension[0] = currentDimension[0] + data[0];
                this.options.dimension[1] = currentDimension[1] + data[1];

                this.modifier.setSize(
                    [currentSize[0] + data[0] * this.options.snapX,
                    currentSize[1] + data[1] * this.options.snapY]);

                this.layouts[this.id].size = [
                    currentSize[0] + data[0] * this.options.snapX,
                    currentSize[1] + data[1] * this.options.snapY
                ];
            }
        }.bind(this));

        this.surface.on('dblclick', function() {
            console.log(this.id, this.getLayouts()[this.id]);
        }.bind(this));

        this._eventInput.on('delete', function() {
            this.removeLayout();
        }.bind(this));

        this._eventInput.on('create', function() {
            console.log('intermediary');
            this._eventOutput.emit('createNewLayout');
        }.bind(this));

        this.surface.draginator = this.draginator;

        this._eventInput.on('select', function(selectedView) {
            if(this === selectedView) {
                this.draginator.select();
            }
        }.bind(this));

        this._eventInput.on('deselect', function() {
            this.draginator.deselect();
        }.bind(this));

        this.surface.on('click', function() {
            this._eventOutput.emit('deselectRest');
            this.draginator.select();
        }.bind(this));
    }

    module.exports = LayoutView;
});
