define(function(require, exports, module) {
    var GridLayout = require('famous/views/GridLayout');

    function GridLayoutCellSized(options) {
        GridLayout.call(this, options);
    }

    GridLayoutCellSized.prototype = Object.create(GridLayout.prototype);
    GridLayoutCellSized.prototype.constructor = GridLayoutCellSized;
    GridLayoutCellSized.prototype.commit = function(context) {
        if (this.options.cellSize) {
            this.options.dimensions[0] = Math.floor(context.size[0] / this.options.cellSize[0]);
            this.options.dimensions[1] = Math.floor(context.size[1] / this.options.cellSize[1]);
        }

        return GridLayout.prototype.commit.call(this, context);
    };

    module.exports = GridLayoutCellSized;
});
