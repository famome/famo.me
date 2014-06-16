define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draginator    = require('Draginator');
    
    var HeaderFooterLayout = require('famous/views/HeaderFooterLayout');
    var RenderController = require('famous/views/RenderController');

    function WorkView() {
        View.apply(this, arguments);
        this.squares = {};
        this.numSquares = 0;
        
        this.renderController = new RenderController();
        this.add(this.renderController);
        
        _createContent.call(this);
    }

    WorkView.prototype = Object.create(View.prototype);
    WorkView.prototype.constructor = WorkView;
    WorkView.prototype.toggleHeader = function() {
        this.header = !this.header;
        this.createHeaderFooter();
    };
    
    WorkView.prototype.toggleFooter = function() {
        this.footer = !this.footer;
        this.createHeaderFooter();
    };
    
    WorkView.prototype.createHeaderFooter = function() {
        this.layout = new HeaderFooterLayout();
        if (this.header) _createHeader.call(this);
        
        if (this.footer) _createFooter.call(this);
        
        if (this.header || this.footer) this.renderController.show(this.layout);
        else this.renderController.hide(this.layout);
    };
    
    WorkView.prototype.createSquare = function() {
      this.numSquares++;
      console.log('creating square', this.numSquares);
      
      var draginator = new Draginator();

      var square = new Surface({
          size: [this.options.squareSize, this.options.squareSize],
          properties: {
              backgroundColor: 'pink',
          },
      });
        
      var squareModifier = new StateModifier({
          origin: [0.5, 0.5],
          align: [0.5, 0.5]
      });
      
      square.on('dblclick', function() {
          square.setContent('hi');
          square.setProperties({
              textAlign: 'center'
          });
      }.bind(this));
      
      draginator.subscribe(square);
      var node = this.add(squareModifier).add(draginator).add(square);
      this.squares['square'+this.numSquares] = node;
    };

    WorkView.DEFAULT_OPTIONS = {
        squareSize: 50
    };
    
    function _createContent() {
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
    }
    
    function _createHeader() {
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
        
        // var headerModifier = new StateModifier({
        //     transform: Transform.translate(0, 0, -1)
        // });
        
        this.layout.header.add(header);
        
        // this.add(this.headerNode);
    }
    
    function _createFooter() {
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
        
        // var footerModifier = new StateModifier({
        //     transform: Transform.translate(0, 0, -1)
        // });
        
        this.layout.footer.add(footer);        
    }

    module.exports = WorkView;
});
