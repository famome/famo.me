define(function(require, exports, module) {
    var Engine     = require("famous/core/Engine");
    var Surface    = require("famous/core/Surface");
    var GridLayout = require("famous/views/GridLayout");

    var AppView = require("views/AppView");

    var mainContext = Engine.createContext();
    mainContext.setPerspective(1000);

    var appView = new AppView();

    mainContext.setPerspective(1000);

    mainContext.add(appView);
});
