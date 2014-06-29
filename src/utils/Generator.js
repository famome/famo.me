define(function(require, exports, module) {
    var Scene      = require('famous/core/Scene');
    var Surface    = require('famous/core/Surface');
    var Transform  = require('famous/core/Transform');

    function Generator() {
        _initializeOutputs.call(this);
    }

    Generator.prototype.constructor = Generator;

    Generator.prototype.generate = function(layouts, width, height) {
        _initializeOutputs.call(this);

        for (var i = 0; i < layouts.length; i++) {
            var layout = layouts[i];
            this.fixed.push(_generateFixedOutput(layout));
            this.flexible.push(_generateFlexibleOutput(layout, width, height));
        }
    };

    Generator.prototype.getFixedOutput = function() {
        return this.fixed.join('\n');
    };

    Generator.prototype.getFlexibleOutput = function() {
        return this.flexible.join('\n');
    };

    Generator.DEFAULT_OPTIONS = {};

    function _initializeOutputs() {
        this.fixed = [];
        this.flexible = [];
    }

    function _generateFlexibleOutput(layout, width, height) {
        var output = generate.flexibleModifier(layout, width, height) +
                     generate.surface(layout);

        return output;
    }

    function _generateFixedOutput(layout) {
        var output = generate.fixedModifier(layout) +
                     generate.surface(layout);

        return output;
    }

    function _generateFlexibleModifierOutput(layout, width, height) {
        var id = layout.getId();
        var size = layout.modifier.getSize();
        var offset = layout.getOffset();

        var output = 'var ' + id + 'Modifier = new Modifier({\n' +
                         '\torigin:[0,0],\n' +
                         '\talign:[' + offset[0]/width + ',' + offset[1]/height + '],\n' +
                     '});\n' +
                     id + 'Modifier.sizeFrom(function(){\n' +
                         '\tvar size = mainContext.getSize();\n' +
                         '\treturn [' + size[0]/width +'*size[0],'+ size[1]/height +'*size[0]];' +
                     '});\n';

        return output;
    }

    function _generateFixedModifierOutput(layout) {
        var id = layout.getId();
        var size = layout.modifier.getSize();
        var offset = layout.getOffset();

        var output = 'var ' + id + 'Modifier = new Modifier({\n' +
                         '\tsize:[' + size + '],\n' +
                         '\ttransform: Transform.translate(' + offset + ')\n' +
                     '});\n';

        return output;
    }

    function _generateSurfaceOutput(layout) {
        var id = layout.getId();

        var output = 'var ' + id + 'Surface = new Surface({\n' +
                         '\tsize:[undefined, undefined],\n' +
                         '\tclasses: [\'red-bg\'],\n' +
                         '\tproperties: {\n' +
                             '\t\ttextAlign: \'center\'\n' +
                         '\t}\n' +
                     '});\n' +
                     'mainContext.add(' + id + 'Modifier).add('+ id + 'Surface);\n\n';
        return output;
    }

    var generate = {
        'fixedModifier': _generateFixedModifierOutput,
        'flexibleModifier': _generateFlexibleModifierOutput,
        'surface': _generateSurfaceOutput
    };

    module.exports = Generator;
});
