(function(){

    mstrmojo.requiresCls("mstrmojo.Container");

    /**
     * A TabStrip widget.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.TabStripBase = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        null,
        
        /**
         * @lends mstrmojo.TabStripBase.prototype
         */
        {
            scriptClass: "mstrmojo.TabStripBase",
            
            /**
             * <p>Handle to the stack object that this tab strip targets.</p>
             * 
             *  @type mstrmojo.StackContainer
             */
            target: null,
            
            /**
             * <p>A hashtable that specifies the names for properties in the target that are relevant to this mstrmojo.TabStrip.</p>
             * 
             * <p>The hashtable may have 0, 1 or more of the following keys:</p>
             * 
             * <dl>
             *      <dt>children</dt>
             *      <dd>Specifies which property of the target contains it child widgets/objects; default = "children".  The tabstrip will create a 
             *         {@link mstrmojo.TabButton} for each child found and listen for add/remove events in the child list.</dd>
             * 
             *      <dt>childTitle</dt>
             *      <dd>Specifies which property of each child of the target defines the child's title (to
             *         be displayed on the {@link mstrmojo.TabButton} for that child); default = "name".</dd>
             * 
             *      <dt>childColor</dt>
             *      <dd>Specifies which property of each child of the target defines the child's color (to
             *         be displayed as the background color for the {@link mstrmojo.TabButton} for that child); default = "tbc".</dd>
             * </dl>
             * 
             * @type Object
             */
            targetProps: null,

            /**
             * <p>This handler is called when the tabstrip's target is set.</p>
             * 
             * <p>It clears the current set of tab buttons (if any), and instantiates a new {@link mstrmojo.TabButton} for each child of the target.  
             * It also *tries* to attach event listeners for add/remove events from the target's children, if the children list is observable.</p>
             * 
             * <p>The callbacks for these listeners handle the adding/removing of corresponding tabbutons for the changed children.  It also
             * tries to listens for changes in the values of the properties that are configured in "targetProps", namely each child's title & tab color.</p>
             * 
             * @param {mstrmojo.Event} evt The "targetChange" event.
             */
            ontargetChange: function ontargetChange(evt) {
                // First, see if we have a handle to the previous target (if any).
                var tWas = evt && evt.valueWas;
                if (tWas) {
                    // Detach any event listeners we attached to it.
                    var ts = this._targetSubs;
                    if (ts) {
                        // Detach both listeners, for add and remove.
                        tWas.detachEventListener(ts.add);                                        
                        tWas.detachEventListener(ts.rem);                                        
                        tWas.detachEventListener(ts.sel);                                        
                    }
                    // Remove all previous tab buttons.
                    this.removeChildren();
                }
                
                // Now process the new target (if any).
                var t = this.target;
                if (t) {
                    // Now process the pre-existing children of the new target.
                    var tps = this.targetProps,
                        p = tps && tps.children || "children",
                        ch = t[p];
                    
                    // Add the buttons for these children.
                    // Add the buttons for these tabs.
                    this.addTabButtons(ch, 0);
                    
                    // In case the target's children list changes later, attach event
                    // listeners for changes in its children.  If the target does not 
                    // implement "attachEventListener", that is okay; we will not attach 
                    // any listeners, and just process whatever pre-exisiting
                    // children it may have already.
                    var fn = 'attachEventListener',
                        id = this.id;
                    
                    if (t[fn]) {
                        this._targetSubs = {
                            add: t[fn]("addChild", id, function (evt) {
                                var btns = evt && evt.value;
                                if (btns && btns.length) {
                                    this.addTabButtons(btns, evt.index);
                                }
                            }),
                            rem: t[fn]("removeChild", id, function (evt) {
                                var arr = evt && evt.value;
                                for (var i = ((arr && arr.length) || 0) - 1; i > -1; i--) {
                                    this.removeTabButton(arr[i]);
                                }
                            }),
                            sel: t[fn]("selectedChange", id, function (evt) {
                                this.selectionChange(evt);
                            })
                        };
                    }
                }
            },
            
            addTabButtons: mstrmojo.emptyFn,
            
            removeTabButton: mstrmojo.emptyFn,
            
            selectionChange: mstrmojo.emptyFn
        }
    );
    
})();