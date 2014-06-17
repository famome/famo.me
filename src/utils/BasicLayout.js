define(function(require, exports, module) {
    var Surface            = require('famous/core/Surface');
    var Transform          = require('famous/core/Transform');
    var StateModifier      = require('famous/modifiers/StateModifier');
    var HeaderFooterLayout = require('famous/views/HeaderFooterLayout');
    

    var BasicLayout = {
        createContent: function() {
            var background = new Surface({
                size: [undefined, undefined],
                classes: ["grey-bg"],
                properties: {
                    lineHeight: '150px',
                    textAlign: "center",
                    zIndex: -1
                }
            });
        
            var backgroundModifier = new StateModifier({
                transform: Transform.translate(0, 0, -1)
            });
        
            this.add(backgroundModifier).add(background);
        },
        
        createHeader: function() {
            var header = new Surface({
                size: [undefined, 100],
                content: "Header",
                classes: ["red-bg"],
                properties: {
                    lineHeight: '100px',
                    textAlign: "center",
                    zIndex: -1
                }
            });
        
            var headerModifier = new StateModifier({
                transform: Transform.translate(0, 0, -1)
            });
        
            this.layout.header.add(headerModifier).add(header);
        },
        
        createFooter: function() {
            var footer = new Surface({
                size: [undefined, 50],
                content: "Footer",
                classes: ["red-bg"],
                properties: {
                    lineHeight: '50px',
                    textAlign: "center",
                    zIndex: -1
                }
            });
        
            var footerModifier = new StateModifier({
                transform: Transform.translate(0, 0, -1)
            });
        
            this.layout.footer.add(footerModifier).add(footer);        
        },
        
        render: function() {
            this.layout = new HeaderFooterLayout();
            if (this.header) BasicLayout.createHeader.call(this);
            if (this.footer) BasicLayout.createFooter.call(this);
        
            if (this.header || this.footer) this.renderController.show(this.layout);
            else this.renderController.hide(this.layout);
        }
    };
    
    module.exports = BasicLayout;
});
