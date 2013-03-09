(function(){

    mstrmojo.requiresCls("mstrmojo.Arr","mstrmojo.Button","mstrmojo.HBox","mstrmojo.FishEye");
    
    
    /**
     * <p>Function to create fisheye scrolling buttons</p>
     * <p>Make it as 'left' or 'right' button by adding/modifying needed properties ('dir', 'alias', 'cssClass')</p> 
     */
    var _createScrollBtn = function(ps) {
        return mstrmojo.hash.copy(
                ps,
                {
                    scriptClass: "mstrmojo.Button",
                    text: '',
                    enabled: false,
                    dir: 'left', //default for left button; overwrite to be 'right' for right button
                    cssClass: 'mstrmojo-icon left', //default : left button
                    onclick: function() {
                        var fel = this.parent.fishEyeList,
                            l = fel && fel.scroll(this.dir, fel.step);
                    }
                });
    };
           
    
    /**
     * FishEye Container Widget 
     * 
     * It has three component: Left Scroll Button, FishEye List, and Right Scroll Button
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.FishEyeContainer = mstrmojo.declare(
    	//superclass
    	mstrmojo.HBox,  
         
        //mixin
        null,
        
       /**
        * @lends mstrmojo.FishEyeContainer.prototype
        */
       {
    		scriptClass: "mstrmojo.FishEyeContainer",
            cssClass: "mstrmojo-FishEyeContainer",
            
            /**
             * <p>This is the same as the selectedIndex of FishEye List.</p>
             * <p>Each time a different fisheye item is selected, this index will be updated with that.</p>
             * <p>This index is to syncronize with the widget that embeds this FishEyeContainer widget - 
             * 		- the embedding widget should listen to change of this selectedIndex to act accordingly;
             * 		- and update this selectedIndex when necessary.</p> 
             */
            selectedIndex: -1,
            
            /**
             * <p>Set property 'items' on FishEye List Widget</p>
             * 
             * @param {Array} items Array of Item objects to display.
             */
            setItems: function(items){
                this.fishEyeList.set('items', items);
            },

            /**
             * <p>Set property 'selectedIndex' on FishEye List Widget</p>
             * <p>This should be called by widget who embed this FishEyeContainer</p>
             * 
             * @param {Integer} idx The index of item to select in FishEye List.
             */
            setSelectedIndex: function(idx){
                this.fishEyeList.set('selectedIndex', idx);
            },
            
            scrollable: false, //flat to indicate whether fisheye is left-scrollable
            rightScrollbale: false, //flat to indicate whether fisheye is right-scrollable
            
            children: [
                      	//left scroll button
                       _createScrollBtn({      
                    	   bindings: {
                                  enabled : "!!this.parent.scrollable"
                                }
                       }),
                                       
                       //fisheye list
                       new mstrmojo.FishEye({
                           items: mstrmojo.Arr.makeObservable([]),
                           srcId: 'obList'
                       }),
                                               
                       
                       //right scroll button
                       _createScrollBtn({
                           alias: 'feScrollRight',
                           cssClass: 'mstrmojo-icon right',
                           dir: 'right',
                           bindings: {
                                 enabled : "!!this.parent.rightScrollable"
                              }
                         })
                       ]
    }); //end mstrmojo.FishEyeContainer
    
    
    /**
     * <p>Add css properties access methods</p>
     */
    mstrmojo.css = mstrmojo.hash.copy(
            {  
                /**
                 * <p>Read specified style, like 'height', etc</p>
                 * 
                 * @param {HTMLElement} el DOM node
                 * @param {String} prop CSS property name to read 
                 */
                getStyleValue : function (el, prop) {
                    var v = null;
                    if (el.currentStyle){ //IE
                        prop = (prop == 'float' ? 'styleFloat' : prop);
                        v = el.currentStyle[prop];
                    }
                    if (document.defaultView && document.defaultView.getComputedStyle){ //FF
                        prop = (prop == 'float' ? 'cssFloat' : prop); 
                        var cs = document.defaultView.getComputedStyle(el, null); 
                        v = cs ? cs[prop] : null;
                    }
    
                    return v;           
                },
    
                /**
                 * <p> Set style value</p>
                 * @param {HTMLElement} el DOM node
                 * @param {Object} prop CSS style property name or array of names.
                 * @param {Object} value CSS style property value or array of values
                 */
                setStyleValue: function (el, prop, value) {
                    var isArray = function (obj) {
                        return !!(obj && (typeof(obj) == 'object') && (typeof(obj.length) == 'number'));
                    };
                    
                    if (isArray(prop) && isArray(value)) {
                        for (var i in prop) {
                            el.style[prop[i]] = value[i];
                        }
                    }
                    else {
                        el.style[prop] = value;
                    }
                }
            }, 
            mstrmojo.css);     
    //end mstrmojo.css
    
})();