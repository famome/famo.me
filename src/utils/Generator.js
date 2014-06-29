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

            for (var i = 0; i < layouts.length; i++) {
                var offset = layouts[i].getOffset();
                var id = layouts[i].getId();
                var size = layouts[i].getSize();

                // console.log(offset);

                data.scene.push({
                    transform: Transform.translate(offset[0], offset[1]),
                    target: {id: id}
                });

                data.surfaces[id] = new Surface({
                    content: id,
                    classes: ['red-bg'],
                    size: size,
                    properties: {
                        textAlign: 'center'
                    }
                });
            }

            return data;
        },
        strings: function(layouts) {
            

            var string = 'var Engine  = require(\'famous/core/Engine\');\n' +
                         'var mainContext = Engine.createContext();\n\n';

            var data = {
                fixed: [string],
                flexible: [string]
            };

            for (var i = 0; i < layouts.length; i++) {
                var offset = layouts[i].getOffset();
                var id = layouts[i].getId();
                var size = layouts[i].modifier.getSize();

                // console.log(offset);

                data.fixed.push(
                    'var ' + id + 'Modifier = new Modifier({\n' +
                        '\tsize:[' + size + '],\n' +
                        '\ttransform: Transform.translate(' + offset + ')\n' +
                    '});\n' +
                    'var ' + id + 'Surface = new Surface({\n' +
                        '\tsize:[undefined, undefined],\n' +
                        '\tclasses: [\'red-bg\'],\n' +
                        '\tproperties: {\n' +
                            '\t\ttextAlign: \'center\'\n' +
                        '\t}\n' +
                    '});\n' +
                    'mainContext.add(' + id + 'Modifier).add('+ id + 'Surface);\n\n'
                );

                data.flexible.push(
                    'var ' + id + 'Modifier = new Modifier({\n' +
                        '\torigin:[0,0],\n' +
                        '\talign:[' + offset[0]/800 + ',' + offset[1]/800 + '],\n' +
                    '});\n' +
                    id + 'Modifier.sizeFrom(function(){\n' +
                        '\tvar size = mainContext.getSize();\n' +
                        '\treturn [' + size[0]/800 +'* size[0],'+ size[0]/800 +'* size[0]];' +
                    '});\n' +
                    'var ' + id + 'Surface = new Surface({\n' +
                        '\tsize:[undefined, undefined],\n' +

                        '\tclasses: [\'red-bg\'],\n' +
                        '\tproperties: {\n' +
                            '\t\ttextAlign: \'center\'\n' +
                        '\t}\n' +
                    '});\n' +
                    'mainContext.add(' + id + 'Modifier).add('+ id + 'Surface);\n\n'
                );
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
            var _generateSurfaceString = function(layout) {
                // console.log(layout.getId(), layout.modifier.getSize());
                return  'scene.id[\'' + layout.getId() + '\'].add(new Surface({\n' +
                            '\tcontent:\'' + layout.getId() + '\',\n' +
                            '\tclasses: [\'red-bg\'],\n' +
                            '\tsize:[' + layout.modifier.getSize() + '],\n' +
                            '\tproperties: {\n' +
                                '\t\ttextAlign: \'center\'\n' +
                            '\t}\n' +
                        '}));\n\n';
            };

            var _generateSurfaceStrings = function(layouts) {
                var string = '';
                for (var i = 0; i < layouts.length; i++) {
                    string += _generateSurfaceString(layouts[i]);
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
