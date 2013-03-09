(function () {

    mstrmojo.requiresCls(
        "mstrmojo.Container",
        "mstrmojo._Formattable");
    
    mstrmojo.DocImage = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [mstrmojo._Formattable],
        
        // instance props+methods
        {
            scriptClass: "mstrmojo.DocImage",
            
            markupString: '<div id="{@id}" class="mstrmojo-DocImage" title="{@tooltip}" style="{@domNodeCssText}">' +
                                '<div style="{@shadowNodeCssText}"><img src="{@v}" style="{@imgNodeCssText}" mstrAttach:click></div>' +
                                '{@buttonNodeMarkup}' + 
                          '</div>', 
                          
            markupSlots: {
                imgNode: function () { return this.domNode.firstChild; }
            },

            /**
             * Updates the DocImage data that may change due to a selector action.
             * 
             * @param {Object} node The widget node.
             */
            update: function update(node) {
                 var ds = this.model.getDataService(),
                 v = node.data.v;
             this.v = (ds && ds.getDocImage && ds.getDocImage(v))|| v;
                
                // if there is a threshold, kill the format
                if (this.thresholdId || node.data.tid) {
                    delete this.fmts;
                }
                
                this.thresholdId = node.data.tid;
            },
            
            formatHandlers: {
                domNode: ['left', 'top', 'z-index'],
                shadowNode: ['width', 'height', 'B','fx'],
                imgNode: [ 'height', 'width', 'B']
            },
           preBuildRendering: function() {
               if (this._super) this._super();
               
               //make the domNode dimension enough to contain the image/border/dropshadow - only IE7 does NOT need this.
               if (!mstrmojo.dom.isIE7) {
                   var fmt = this.getFormats(),
                       ds = fmt.fx && fmt.fx.ds || 0,  //dropshadow size
                       border = mstrmojo._Formattable.getBorderWidths(this);

                   this.domNodeCssText += 'width:' + ((parseInt(fmt.width, 10) || 0) + ds + border.w) + 'px;' + ' height: ' +  ((parseInt(fmt.height, 10) || 0) + ds + border.h) + 'px;';
               }
           }
        }
    );
    
})();