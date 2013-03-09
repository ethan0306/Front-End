(function(){

    mstrmojo.requiresCls("mstrmojo.array",
"mstrmojo.Container",
        "mstrmojo._BindTargetChildren",
                         "mstrmojo.TabStripBase");

    var _A = mstrmojo.array;
    
    function _hideCheck(me, len){
        if (me.autoHide) {
            me.set("visible", len);
        }
    }

    /**
     * A TabStrip widget.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.TabStrip = mstrmojo.declare(
        // superclass
        mstrmojo.TabStripBase,
        
        // mixins,
        [mstrmojo._BindTargetChildren],
        
        /**
         * @lends mstrmojo.TabStrip.prototype
         */
        {
            scriptClass: "mstrmojo.TabStrip",
            
            markupString: '<div id="{@id}" class="mstrmojo-TabStrip {@cssClass}" style="{@cssText}"></div>',

            markupSlots: {
                containerNode: function(){ return this.domNode; }
            },
            
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = this.visible ? 'block' : 'none'; }
            },
            
            /**
             * <p>If true, whenever a child is added or removed from this tabstrip,
             * the tabstrip's "visible" property will be set to true only if the tabstrip has
             * ONE or more children.</p>
             * 
             * @type Boolean
             */
            autoHide: true,

            /**
             * <p>The Class name of the tab buttons to be instantiated by this tab strip.  <b>NOTE:</b> The class must be contained in the root mstrmojo package.</p>
             * 
             * @type String
             */
            tabButtonClass: "TabButton",

            /**
             * <p>Extends the init method inherited from Container in order to support the autoHide property.</p>
             * 
             * <p>If autoHide is truthy, then we initialize the "visible" property to false, and later update
             * the property if/when children are added to this tab strip.</p>
             * 
             * @ignore
             */
            init: function init_TabStrip(/*Object?*/ props) {
                // Support for autoHide: initialize our visible property to false.
                if (props && props.autoHide) {
                    props.visible = false;
                }
                
                // Call the inherited superclass constructor to process our properties.
                this._super(props);
            },
                                                    
            /**
             * <p>Instantiates new tab button child widgets for each model.</p> 
             * 
             * <p>The title & color of each button are derived from the given model object, which is typically
             * a child widget in a StackContainer, but could in theory be any some other
             * javascript object which exposes the same properties.</p>
             * 
             * <p>The new tab button widgets are then added to the children of this tab strip at the given index; if the
             * index is undefined, the child is appended by default.</p>
             * 
             * @param {mstrmojo.Model[]} models The models for the buttons, which is target's children.
             * @param {Integer} index The index at which to start adding the buttons.
             * 
             */
            addTabButtons: function addTabButtons(models, index) {
                var tps = this.targetProps || {},
                    t = tps.childTitle || 'n',
                    c = tps.childColor || 'tbc',
                    Sc = this.tabButtonClass,
                    btns = [],
                    stack = this.target,
                    oc = function(evt){
                        stack.set("selected", this.target);
                    };
                
                // Make sure we have the button class.
                mstrmojo.requiresCls('mstrmojo.' + Sc);
                
                // Iterate the button models.
                for (var i = 0, len = (models&&models.length)||0; i < len; i++) {
                    var b = models[i],  // Single button.
                        ttl = b[t];     // Button title.
                    
                    if (ttl) {
                        // Create new button.
                        var btn = mstrmojo.insert({
                            scriptClass: 'mstrmojo.' + Sc,
                            title: ttl,
                            backgroundColor: b[c],
                            target: b,
                            onclick: oc
                        });
                        
                        // Add to collection.
                        btns.push(btn);
                    }
                }
                
                // Did we create some buttons?
                if (btns.length) {
                    // Add the new buttons to the tab strip.
                    _hideCheck(this, btns.length);                
                    this.addChildren(btns, index);
                }
                
                // Read the current selection, if any.
                this.selectionChange();                
            },
                        
            /**
             * <p>Removes the tab button that corresponds to a given button target.</p>
             * 
             * <p>Searches thechildren of this tab strip for a tab button whose target matches the given object;
             * if found, that tab button is removed.</p>
             * 
             * @param {Object} tgt The target of the button to remove.
             * 
             */
            removeTabButton: function rmvTabBtn(tgt) {
                var btns = mstrmojo.array.filter(this.children, function (btn) { return (btn.target === tgt); }, { max: 1 });
                if (btns && btns[0]) {
                    _hideCheck(this, btns.length - 1);                
                    this.removeChildren(btns[0]);
                    btns[0].destroy();
                }
            },
            
            /**
             * Clear all the buttons generated.
             */
            clearButtons: function(){
                this.removeChildren();
            }
        }
    );
    
})();