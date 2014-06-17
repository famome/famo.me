define(function(require, exports, module) {
    var Surface            = require('famous/core/Surface');
    var Transform          = require('famous/core/Transform');
    var StateModifier      = require('famous/modifiers/StateModifier');
    var HeaderFooterLayout = require('famous/views/HeaderFooterLayout');

    var MouseSync     = require("famous/inputs/MouseSync");
    var TouchSync     = require("famous/inputs/TouchSync");
    var ScrollSync    = require("famous/inputs/ScrollSync");
    var GenericSync   = require("famous/inputs/GenericSync");

    GenericSync.register({
        "mouse"  : MouseSync,
        "touch"  : TouchSync,
        "scroll" : ScrollSync
    });

    var sync = new GenericSync({
      "mouse"  : {},
      "touch"  : {},
      "scroll" : {scale : .5}
    });

    var SyncHandler = {

    };

    module.exports = SyncHandler;
});
