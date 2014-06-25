define(function(require, exports, module) {
    var Scene      = require('famous/core/Scene');
    var Surface    = require('famous/core/Surface');
    var Transform  = require('famous/core/Transform');
    
    var generator = {
        sceneData: function(layouts) {
            var data = {
                scene: [],
                surfaces: {}
            };

            for (var layout in layouts) {
                data.scene.push({
                    transform: Transform.translate(layouts[layout].offset[0], layouts[layout].offset[1]),
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
        },
        output: function(sceneJSON, layouts) {
            var _generateSurfaceString = function(layout, layouts) {
                return  'scene.id[\'' + layout + '\'].add(new Surface({\n' +
                            '\tcontent:\'' + layout + '\',\n' +
                            '\tclasses: [\'red-bg\'],\n' +
                            '\tsize:[' + layouts[layout].size + '],\n' +
                            '\tproperties: {\n' +
                                '\t\ttextAlign: \'center\'\n' +
                            '\t}\n' +
                        '}));\n\n';
            };

            var _generateSurfaceStrings = function(layouts) {
                var string = '';
                for (var layout in layouts) {
                    string += _generateSurfaceString(layout, layouts);
                }
    
                return string;
            };

            var string = 'var scene = new Scene({\n' +
                         '\tid: \'root\',\n' +
                         '\topacity: 1,\n' +
                         '\ttarget: ' + JSON.stringify(sceneJSON, null, '\t') + '\n' +
                         '});\n\n' +
                         '' + _generateSurfaceStrings(layouts) + '\n\n';

            string = string.replace(/\"transform\"\:\ \[\n\W+/g, '"transform": [').replace(/^\W+(\d+)\,\n/gm,'$1, ').replace(/\,\W+(\d+)/g,', $1').replace(/\n\W+?\]\,/g,'],');
            return string;
        },
        
    };

    module.exports = generator;
});