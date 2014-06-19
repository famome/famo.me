define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var EventHandler  = require('famous/core/EventHandler');
    var Draginator    = require('Draginator');

    function LayoutView() {
        View.apply(this, arguments);
        
        this.xOffset = 0;
        this.yOffset = 0;
        
        _createLayoutDraginator.call(this);
        _createLayoutModifier.call(this);
        _createLayoutSurface.call(this);
        
        _setListeners.call(this);
        
        this.add(this.draginator).add(this.modifier).add(this.surface);
    }

    LayoutView.prototype = Object.create(View.prototype);
    LayoutView.prototype.constructor = LayoutView;
    LayoutView.prototype.getOffset = function() {
      return [this.xOffset, this.yOffset];  
    };

    LayoutView.DEFAULT_OPTIONS = {
        snapX: 100,
        snapY: 100,
        offset: [0, 0],
        dimension: [1, 1],
        color: 'pink',
        size: 100,
        edgeDetectSize: 10
    };
    
    function _createLayoutDraginator() {
        this.draginator = new Draginator({
          snapX: this.options.snapX,
          snapY: this.options.snapY
        });
    }
    
    function _createLayoutModifier() {
        this.modifier = new StateModifier({
            size: [this.options.size, this.options.size]
        });
    }

    function _createLayoutSurface() {
        this.surface = new Surface({
            properties: {
                backgroundColor: this.options.color,
                cursor: '-webkit-grab'
            }
        });
    }

    // layoutView._eventInput.on('mousemove', function(event) {
    function _setEdges(event) {
        var edge = '';

        var edges = {
          n : { properties: { cursor: 'ns-resize'} },
          nw: { properties: { cursor: 'nwse-resize'} },
          w : { properties: { cursor: 'ew-resize'} },
          sw: { properties: { cursor: 'nesw-resize'} },
          s : { properties: { cursor: 'ns-resize'} },
          se: { properties: { cursor: 'nwse-resize'} },
          e : { properties: { cursor: 'ew-resize'} },
          ne: { properties: { cursor: 'nesw-resize'} }
        };

        if (event.offsetY < this.options.edgeDetectSize)
            edge = 'n';
        if (this.options.snapY * this.options.dimension[1] - event.offsetY < this.options.edgeDetectSize)
            edge = 's';
        if (event.offsetX < this.options.edgeDetectSize)
            edge += 'w';
        if (this.options.snapY * this.options.dimension[0] - event.offsetX < this.options.edgeDetectSize)
            edge += 'e';

        console.log('detected! ', edge);
        this.setOptions({properties: {cursor: 'ns-resize'}})
    };
    
    function _setListeners() {
        // initialize eventing linkages
        this.modifier.eventHandler = new EventHandler();
        this.draginator.eventOutput.pipe(this.modifier.eventHandler);
        this.modifier.eventHandler.pipe(this._eventInput);
        this.surface.pipe(this);
        this._eventInput.pipe(this.draginator);
        this.draginator.eventOutput.pipe(this._eventInput);

        // view listens for translate from draggable
        this._eventInput.on('translate', function(data){
            this.xOffset += data[0];
            this.yOffset += data[1];
            console.log(data, this.getOffset());
        }.bind(this));

        this._eventInput.on('mousemove', _setEdges.bind(this));
        
        // view listens for resize from draggable
        this.modifier.eventHandler.on('resize', function(data) {
            // this.emit('enlarge', data);
        }.bind(this));

        // // view listens for enbiggen from modifier
        // this._eventInput.on('enlarge', function(data){
        //   this.xOffset += data[0];
        //   this.yOffset += data[1];
        // });

        this.surface.on('dblclick', function() {
            this.setContent('click?');
            this.setProperties({
                textAlign: 'center'
            });
        });
    }

    module.exports = LayoutView;
});
