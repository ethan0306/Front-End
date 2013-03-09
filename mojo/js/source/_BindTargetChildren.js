(function(){
    mstrmojo.requiresCls("mstrmojo.array");
    
    var _A = mstrmojo.array;
    
    
    /**
     * <p> A mixin to bind a items property in this widget to target's children. When target's children is added a new one or removed, this widget is also notified.</p>
     * 
     * <p>For example, this mixin is used in mstrmojo.TabStrip and mstrmojo.TabNameList</p>
     * @class
     * @public
     */
    mstrmojo._BindTargetChildren = {
            
            /**
             * <p>Handle to the stack object that this tab strip applies to.
             * This tab strip will show a tab button for each child in the target.</p>
             * 
             *  @type mstrmojo.StackContainer
             */
            target: null,
            
            /**
             * <p>A hashtable that specifies the names for properties in the target.</p>
             * 
             * <p>The hashtable may have 0, 1 or more of the following keys:</p>
             * 
             * <dl>
             *       <dt>names</dt>
             *      <dd>Specifies which property of this widget contains the name list or button list; default = "children" ("items" from TabNameList).</dd>
             *         
             *      <dt>children</dt>
             *      <dd>Specifies which property of the target contains it child widgets/objects; default = "children".  The tabstrip will create a 
             *         {@link mstrmojo.TabButton} for each child found and listen for add/remove events in the child list, TabNameList will create items list.</dd>
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
             * Overwrite in subclass, parse target's children to add new items in this widget's items property.
             */
            addTabButtons: null,
            
            /**
             * Overwrite in subclass, parse target's children to remove items in this widget's items property.
             */
            removeTabButtons: null,
            
            /**
             * Clear all the buttons
             */
            clearButtons: null,
            
            /**
             * <p>This handler is called when the tabstrip/tabNameList's target is set.</p>
             * 
             * <p>It clears the current set of tab buttons (if any), and instantiates a new {@link mstrmojo.TabButton} or item for each child of the target.  
             * It also *tries* to attach event listeners for add/remove events from the target's children, if the children list is observable.</p>
             * 
             * <p>The callbacks for these listeners handle the adding/removing of corresponding tabbutons for the changed children.  It also
             * tries to listens for changes in the values of the properties that are configured in "targetProps", namely each child's title & tab color.</p>
             * 
             * @param {mstrmojo.Event} evt The "targetChange" event.
             */
            ontargetChange: function ontargetChg(evt) {
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
                    this.clearButtons();
                }
                
                // Now process the new target (if any).
                var t = this.target;
                if (t) {
                    // Now process the pre-existing children of the new target.
                    var tps = this.targetProps,
                        p = tps && tps.children || "children",
                        ch = t[p];
                    
                    // Add the buttons for these children.
                    this.addTabButtons(ch, 0);
                    
                    // Read the current selection, if any.
                    this._onTargetSelChg();
                    
                    // In case the target's children list changes later, attach event
                    // listeners for changes in its children.  If the target does not 
                    // implement "attachEventListener", that is okay; we will not attach 
                    // any listeners, and just process whatever pre-exisiting
                    // children it may have already.
                    if (t.attachEventListener) {
                        var id = this.id,
                            fn = 'attachEventListener';
                        this._targetSubs = {
                            add: t[fn]("addChild", id, "_onTargetAddChild"),
                            rem: t[fn]("removeChild", id, "_onTargetRemoveChild"),
                            sel: t[fn]("selectedChange", id, "_onTargetSelChg")
                        };
                    }
                }
                
                //Customized hook
                if(this._ontargetChange){
                    this._ontargetChange();
                }
                
            },
            
            /**
             * <p>This handler is called whenever a child is added to target.</p>
             * 
             * <p>It instructs this tab strip to create a tabButton that corresponds to that child.
             * Assumes event argument has a "value" property which stores a handle to the
             * child that was just added to the target, and an "index" property which specifies
             * which index the child was inserted at.</p>
             * 
             * @param {mstrmojo.Event} evt The 'addChild' event.
             */
            _onTargetAddChild: function otac(evt) {
                var btns = evt && evt.value;
                if (btns && btns.length) {
                    this.addTabButtons(btns, evt.index);
                }
                
                //Customized hook
                if(this._postTargetAddChild){
                    this._postTargetAddChild();
                }
            },
            
            /**
             * <p>This handler is called whenever a child is removed from the target.  It
             * instructs this tab strip to remove the tabButton that corresponds to that child.</p>
             * 
             * <p>Assumes event argument has a "value" property which stores a handle to the
             * child that was just removed from the target.</p>
             * 
             * @param {mstrmojo.Event} evt The "removeChild" event.
             */
            _onTargetRemoveChild: function otrc(/*Event*/ evt) {
                var arr = evt && evt.value;
                for (var i=((arr&&arr.length)||0) -1; i>-1; i--) {
                    this.removeTabButton(arr[i]);
                }
                //Customized hook
                if(this._postTargetRemoveChild){
                    this._postTargetRemoveChild();
                }
            },
            
            /**
             * <p>This handler is called whenever the target's selection changes.  It
             * instructs this tab strip to hilite the corresponding tab button and unhilite
             * the previously hilited tab button.</p>
             * 
             *  @param {mstrmojo.Event} evt The "selectedChange" event.
             */
            _onTargetSelChg: function otsc(evt){
                var tps = this.targetProps || {},
                ch = this[tps.names || 'children'],
                setSelected = function(w, v){
                    if(w.set){
                        w.set('selected', v);
                    } else{
                        w.selected = v;
                    }
                };
                if (evt){
                    var sOld = evt.valueWas,
                        w = sOld ? _A.find(ch, 'target', sOld) : -1;
                    if (w>-1) {
                        setSelected(ch[w], false);
                    }
                }
                var t = this.target,
                    s = t && t.selected,
                    w2 = s ? _A.find(ch, 'target', s) : -1;
                if (w2>-1){
                    setSelected(ch[w2], true);
                }
                
                //Customized hook
                if(this._postTargetSelChg){
                    this._postTargetSelChg();
                }
            }
    };

})();