(function () {

    mstrmojo.requiresCls("mstrmojo.Widget",
                         "mstrmojo.dom");
    
    var baseCssClass = 'mstrmojo-Image';
    
    /**
     * An image class.
     * 
     * @class
     * @extends mstrmojo.Widget
     * 
     */
    mstrmojo.Image = mstrmojo.declare(

        mstrmojo.Widget,

        null,

        /**
         * @lends mstrmojo.Image
         */
        {
            scriptClass: "mstrmojo.Image",
            
            markupString: '<div id="{@id}" class="' + baseCssClass + ' {@cssClass}" style="{@cssText}">' +
                              '<image src="{@src}" mstrAttach:load />' +
                          '</div>',
                          

            markupSlots: {
                imgNode: function () { return this.domNode.firstChild; }
            },
            
            markupMethods: {
                onsrcChange: function () {
                    // Do we have an imgNode?
                    var imgNode = this.imgNode;
                    if (imgNode) {
                        // Set image source.
                        imgNode.src = this.src || '../javascript/mojo/css/images/1ptrans.gif';
                    }
                },
                oncssClassChange: function () {
                    // Do we have a domNode?
                    var domNode = this.domNode;
                    if (domNode) {
                        // Set dom node css class to the cssClass property (or base class if empty).
                        domNode.className = this.cssClass || baseCssClass;
                    }
                },
                onvisibleChange: function () { this.domNode.style.display = (this.visible) ? this.cssDisplay : 'none'; }
            },
            
            /**
             * The src of the image.
             * 
             * @type String
             * @default ""
             */
            src: '',
            
            /**
             * Returns the inner height and width of the image node.
             * 
             * @type Object
             */
            getImageSize: function getImageSize() {
                var imgNode = this.imgNode;
                return {
                    w: imgNode.clientWidth,
                    h: imgNode.clientHeight
                };
            }
        }
    );
    
    /**
     * The base CSS class applied to the domNode.
     * 
     * @static
     * @type String
     */
    mstrmojo.Image.baseCssClass = baseCssClass;
    
}());