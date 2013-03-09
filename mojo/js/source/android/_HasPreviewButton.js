(function() {

    mstrmojo.requiresCls("mstrmojo.dom", "mstrmojo.css", "mstrmojo.hash", "mstrmojo.Button");
    
    var $BTN = mstrmojo.Button.newAndroidButton,
        $D = mstrmojo.dom,
        $C = mstrmojo.css,
        $H = mstrmojo.hash;    
    
    mstrmojo.android._HasPreviewButton = mstrmojo.provide(
        "mstrmojo.android._HasPreviewButton",
        {
            _mixinName: "mstrmojo.android._HasPreviewButton",
            
            previewButton: null, //reference to the button widget
            
            toggleImagesCss: null, //image list using for toggling
            
            buttonRef: {
                scriptClass: "mstrmojo.HBox",
                colHTML: '<colgroup><col></col><col></col></colgroup>',
                cssClass: 'mstrmojo-Android-PreviewButton',
                addGlow: function() {
                    $C.addClass(this.icon.domNode, 'tapped');
                },
                removeGlow: function() {
                    //TQMS 499489: In android webview on tablet, changing the background css in touch event handler would cause some rendering problem.
                    //Some part of the screen is not got repainted. To work it around, we need to delay the css change.
                    var me = this;
                    setTimeout(function(){
                        $C.removeClass(me.icon.domNode, 'tapped');
                    }, 15);
                },
                children: [{
                    scriptClass: "mstrmojo.Button",
                    alias: 'label',
                    cssClass: 'label',
                    ontouchstart: function() {
                        this.parent.addGlow();
                    },
                    ontouchend: function() {
                        this.parent.removeGlow();
                    }
                }, {
                    scriptClass: "mstrmojo.Button",
                    alias: 'icon',
                    cssClass: 'icon',
                    oniconCssClassChange: function(){
                        if (this.domNode){
                            this.domNode.className = 'mstrmojo-Button ' + this.cssClass + ' ' + this.iconCssClass;
                        }
                    },
                    ontouchstart: function() {
                        this.parent.addGlow();
                    },
                    ontouchend: function() {
                        this.parent.removeGlow();
                    }
                }]
            },
            
            /**
             * Replace a given dom node with created preview button.
             * @param {HTMLElement} target The dom node to placing the button with.
             * @param {String} value The text value showing inside the preview button
             */
            renderPreviewButton: function(/*DOMNode*/target, value) {
                var pb = this.previewButton; 
                if(!pb) {
                    // wipe out the inner HTML content of the openerNode
                    target.innerHTML = "";
                    pb = this.previewButton= mstrmojo.insert(this.buttonRef);
                    pb.render();
                }
                pb.label.set('text', value);
                pb.icon.set('iconCssClass', this.toggleImagesCss);
                target.appendChild(pb.domNode);
            }
        }
    );
    
}());