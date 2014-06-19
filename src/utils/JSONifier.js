define(function(require, exports, module) {

    var JSONifier = {
        JSONify: function(view) {
            return {
                // origin is 0 by default for now
                id: view.getId(),
                size: view.getSize(),
                offset: view.getOffset()
            }
        }
    };

    module.exports = JSONifier;
});