define(function(require, exports, module) {
    var Scene      = require('famous/core/Scene');
    var Surface    = require('famous/core/Surface');
    var Transform  = require('famous/core/Transform');
    
    var generator = {
        sceneData: function(layouts, cw) {
            var data = {
                scene: [],
                surfaces: {}
            };

            for (var layout in layouts) {
                data.scene.push({
                    transform: Transform.translate(layouts[layout].offset[0]*cw, layouts[layout].offset[1]*cw),
                    target: {id: layout}
                });

                data.surfaces[layout] = new Surface({
                    content: layout,
                    classes: ['red-bg'],
                    size: layouts[layout].size,
                    properties: {
                        textAlign: 'center'
                    }
                });
            }

            return data;
        },
        scene: function(sceneJSON) {
            var scene = new Scene({
                id: 'root',
                opacity: 1,
                target: sceneJSON
            });

            return scene;
        }
    };

    module.exports = generator;
});