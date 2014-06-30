define(function(require, exports, module) {

    function Generator() {
        _initializeOutputs.call(this);
    }

    Generator.prototype.constructor = Generator;

    Generator.prototype.generate = function(layouts, width, height) {
        _initializeOutputs.call(this);

        for (var i = 0; i < layouts.length; i++) {
            var layout = layouts[i];
            _determineDependencies.call(this, layout);
            this.fixed.push(_generateFixedOutput(layout));
            this.flexible.push(_generateFlexibleOutput(layout, width, height));
        }
    };

    Generator.prototype.getFixedOutput = function() {
        return _wrapOutput.call(this, this.fixed.join('\n'));
    };

    Generator.prototype.getFlexibleOutput = function() {
        return _wrapOutput.call(this, this.flexible.join('\n'));
    };

    Generator.DEFAULT_OPTIONS = {};

    function _determineDependencies(layout) {
        this.dependencies[layout.type] = true;
    }

    function _wrapOutput(input) {
        var output = _generateComments();
        output += 'define(function(require, exports, module) {\n' +
        '\tvar Engine = require(\'famous/core/Engine\');\n';

        var keys = Object.keys(this.dependencies);
        for (var i = 0; i < keys.length; i++) {
            output += dependencies[keys[i]];
        }
        output += '\n\tvar mainContext = Engine.createContext();\n\n';
        output += input;
        output += '});\n';

        return output;
    }

    function _initializeOutputs() {
        this.fixed = [];
        this.flexible = [];
        this.dependencies = {};
    }

    function _generateComments() {
        var output = '/**\n' +
                     ' * Comments start here\n' +
                     ' *\n' +
                     ' * continue here\n' +
                     ' * and here too.\n' +
                     ' */\n';

        return output;
    }

    function _generateFlexibleOutput(layout, width, height) {
        var output = generate.flexibleModifier(layout, width, height) +
                     generate[layout.type](layout);

        return output;
    }

    function _generateFixedOutput(layout) {
        var output = generate.fixedModifier(layout) +
                     generate[layout.type](layout);

        return output;
    }

    function _generateFlexibleModifierOutput(layout, width, height) {
        var id = layout.getId();
        var size = layout.modifier.getSize();
        var offset = layout.getOffset();

        var output = '\tvar ' + id + 'Modifier = new Modifier({\n' +
                         '\t\torigin:[0,0],\n' +
                         '\t\talign:[' + offset[0]/width + ',' + offset[1]/height + '],\n' +
                     '\t});\n' +
                     '\t' + id + 'Modifier.sizeFrom(function(){\n' +
                         '\t\tvar size = mainContext.getSize();\n' +
                         '\t\treturn [' + size[0]/width +'*size[0],'+ size[1]/height +'*size[0]];\n' +
                     '\t});\n';

        return output;
    }

    function _generateFixedModifierOutput(layout) {
        var id = layout.getId();
        var size = layout.modifier.getSize();
        var offset = layout.getOffset();

        var output = '\tvar ' + id + 'Modifier = new Modifier({\n' +
                         '\t\tsize:[' + size + '],\n' +
                         '\t\ttransform: Transform.translate(' + offset + ')\n' +
                     '\t});\n';

        return output;
    }

    function _generateSurfaceOutput(layout) {
        var id = layout.getId();

        var output = '\tvar ' + id + 'Surface = new Surface({\n' +
                         '\t\tsize:[undefined, undefined],\n' +
                         '\t\tclasses: [\'red-bg\'],\n' +
                         '\t\tproperties: {\n' +
                             '\t\t\ttextAlign: \'center\'\n' +
                         '\t\t}\n' +
                     '\t});\n' +
                     '\tmainContext.add(' + id + 'Modifier).add('+ id + 'Surface);\n\n';
        return output;
    }

    var generate = {
        'fixedModifier': _generateFixedModifierOutput,
        'flexibleModifier': _generateFlexibleModifierOutput,
        'surface': _generateSurfaceOutput
    };

    var dependencies = {
        'surface': '\tvar Surface = require(\'famous/core/Surface\');\n'
    };

    module.exports = Generator;
});
