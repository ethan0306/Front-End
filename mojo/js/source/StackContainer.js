(function(){

    mstrmojo.requiresCls(
        "mstrmojo.array",
        "mstrmojo.Container",
        "mstrmojo._CanRenderChildrenOnShow");
        
    var _A = mstrmojo.array;

    /**
     * <p>StackContainer is a Container that shows a single child Widget at a time.</p>
     *
     * <p>StackContainer supports a "selected" property, which can be set to a child of the StackContainer or null.
     * When this property is updated, the selected child's "visible" property is set to true, while the other
     * children's "visible" property is set to false.</p>
     *
     * @class
     */
    mstrmojo.StackContainer = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [mstrmojo._CanRenderChildrenOnShow],
        
        // instance props+methods
        /**
         * @lends mstrmojo.StackContainer.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.StackContainer",

            isStack: true,
            
            /**
             * @ignore
             */
            markupString: '<div id="{@id}" class="mstrmojo-StackContainer {@cssClass}" style="{@cssText}"></div>',

            /**
             * @ignore
             */
            markupMethods: {
                onwidthChange: function(){
                    if(!isNaN(parseInt(this.width))){
                        this.domNode.style.width = this.width;
                    }
                },
                onheightChange: function(){
                    if(!isNaN(parseInt(this.height))){                    
                        this.domNode.style.height = this.height;
                    }
                },
                onborderChange: function(){ this.domNode.style.border = this.border || ''; },
                onbackgroundChange: function(){ this.domNode.style.background = this.background || ''; }
            },
            
            /**
             * @ignore
             */
            markupSlots: {
                containerNode: function(){ return this.domNode; }
            },

            /**
             * <p>Toggles the visibility of the child referenced by the "selected" property.</p>
             *
             * <p>This custom setter enables the StackContainer to show a single child widget at a time.
             * The "selected" property should be set to a single child widget of this StackContainer, or null.
             * In turn, the StackContainer will hide the previously selected child widget, and show the
             * newly selected widget if any.</p>
             *
             * @param {String} n="selected" The property whose value is to be set.
             * @param {mstrmojo.Widget} [v] The newly selected child widget, or null.
             */
            _set_selected: function stsel(n, v) {
                var was = this.selected;
                if (was === v) {
                    return false;
                }
                // Use set() to toggle children so that other listeners (like a tabstrip) can hear.
                if (was) {
                    was.set("visible", false);
                }
                this.selected = v;
                if (v) {
                    v.set("visible", true);
                }
                return true;
            },


            /**
             * Extends in the inherited method in order to hide all children which are not the current selection.
             * @ignore
             */
            addChildren: function ac(ch, idx, silent) {
                // Hide the children first before calling the inherited method, so that they are not visible
                // in DOM momentarily while the inherited method adds them to the HTML.
                var sel = this.selected,
                    c;
                for (var i=0, len = (ch && ch.length) || 0; i <len; i++){
                    c = ch[i];
                    if(c && c.set){
                        c.set("visible", c === sel);
                    }
                }
            
                // Call the superclass method.
                return this._super(ch, idx, silent);
            },
            
            /**
             * Extends the inherited method in order to reset the "selected" property if that child was removed.
             * @ignore
             */
            removeChildren: function rc(c, silent){
                var ret = this._super(c, silent);
                if (!c || (c === this.selected)) {  // if !c, we remove all children
                    this.set("selected", null);
                }
                return ret;
            },
            
            /**
             * Extends the inherited method in order to clear the handle to the selected child.
             */
            destroy: function dst(skipCleanup) {
                this._super(skipCleanup);
                this.selected = null;
            },
            
            renderMode: "onshow"
        }
    );
    
})();