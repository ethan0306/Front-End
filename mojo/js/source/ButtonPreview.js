(function(){

    mstrmojo.requiresCls(
        "mstrmojo.Widget",
        "mstrmojo.css",
        "mstrmojo.dom");
    
   /**
     * <p>ButtonPreview displays a preview of the button on the iPhone screen.</p>
     *
     * <p>ButtonPreview is a widget that displays a preview of the iPhone Home Screen button. It supports glass/solid/none style
     * as well as different settings for the button caption (inside parallel to the icon, under the icon, or outside). </p>
     *
     * @class
     */
    var _C = mstrmojo.css;
    
    var STYLE_GLASS = 3,
        STYLE_FLAT = 2, 
        STYLE_NONE = 1;
    
    mstrmojo.ButtonPreview = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.ButtonPreview",
            
            /**
             * Caption for the button
             */
            caption: null,

            /**
             * Background color
             */
            fillColor: "#EEEEEE", 
            
            /**
             * Font color for the button caption (black by default)
             */
            fontColor: "#000000",
            
            /**
             * Border color for the button (white by default)
             */
            border: "#FFFFFF",
            
            /**
             * Button style: glass(3), solid(1), beveled(2) or none(0).
             */
            style: STYLE_GLASS,
            
            markupString: '<div id="{@id}" class="mstrmojo-Mobile-button {@cssClass}" style="{@cssText}" mstrAttach:mouseover,mouseout,click>'+
                               '<div class="mstrmojo-Mobile-button-highlight">'+
                                      '<div class="mstrmojo-Mobile-button-border"></div>'+
                                      '<div class="mstrmojo-Mobile-button-radial"></div>'+
                                      '<div class="mstrmojo-Mobile-button-icon"><img src="{@icon}" style="position:absolute"></div>'+
                                      '<div class="mstrmojo-Mobile-button-caption-in"></div>'+
                                      '<div class="mstrmojo-Mobile-button-glass"></div>'+
                               '</div>'+
                               '<label class="mstrmojo-Mobile-button-caption-out">{@caption}</label>'+   
                          '</div>',
            
            markupSlots: {
                // Highlight border when mouse over it
                highlightNode: function(){return this.domNode.firstChild;},
                // Border and background color
                borderNode: function(){return this.domNode.firstChild.childNodes[0];},
                // Caption nodes
                outerCaptionNode: function(){return this.domNode.lastChild;}, 
                innerCaptionNode: function(){return this.domNode.firstChild.childNodes[3];},
                // Icon
                iconNode: function(){return this.domNode.firstChild.childNodes[2].firstChild;}, 
                // Glass effect
                glassNode: function() {return this.domNode.firstChild.childNodes[4];}
            },
            
            onmouseover: function(){
                _C.addClass(this.highlightNode, ["hover"]);
            },
            
            onmouseout: function(){
                _C.removeClass(this.highlightNode, ["hover"]);
            },
            
            markupMethods: {
                onselectedChange: function(){
                    _C.toggleClass(this.highlightNode, ["selected"], this.selected);
                },
                
                onvisibleChange: function(){ 
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                },
                
                oncaptionChange: function(){ 
                    this.innerCaptionNode.innerHTML = this.outerCaptionNode.innerHTML = mstrmojo.string.encodeHtmlString(this.caption || ''); 
                },
                
                onfillColorChange: function() {
                    this.borderNode.style.backgroundColor = this.fillColor;
                },
                
                onfontColorChange: function() {
                    this.innerCaptionNode.style.color = this.outerCaptionNode.style.color = this.fontColor;
                },
                
                oniconChange: function() {
                    if (this.icon){
                        this.iconNode.src = "";
                        this.iconNode.style.display = "none"; //hide the image first
                        var me = this;
                        // create a new image to get its full size.
                        var i = new Image();
                        i.onload = function(){
                            var w = 48, h = 48;
                            var w1 = this.width, h1 = this.height; 
                            var r1 = (w1<w)?1:(w1/w), r2 = (h1<h)?1:(h1/h);
                            var ratio = (r1>r2)?r1:r2;
                            var iconNode = me.iconNode;
                            if (iconNode){
	                            iconNode.width = (w1/ratio); //keep the orignal aspect ratio
	                            iconNode.height = (h1/ratio);
	                            iconNode.src = me.icon;
	
	                            iconNode.style.left = (48 - w1/ratio)/2+"px"; // position this image to the right place
	                            iconNode.style.top = (48 - h1/ratio)/2+"px";
	                            iconNode.style.display = "inline"; // show it after it's loaded
                            }
                        };
                        i.src = me.icon;
                    }else{
                        this.iconNode.src = "";
                        this.iconNode.style.display = "none";
                    }
                },   
                
                onborderChange: function() {
                    this.borderNode.style.borderColor = this.border;
                },
                
                onstyleChange: function() {
                    _C.toggleClass(this.glassNode, ["off"], (this.style !== STYLE_GLASS));
                    _C.toggleClass(this.borderNode, ["off"], (this.style === STYLE_NONE));
                }
            } 
        });
})();