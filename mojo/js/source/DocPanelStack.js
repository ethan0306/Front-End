(function(){

    mstrmojo.requiresCls("mstrmojo.Container",
        "mstrmojo._Formattable",
        "mstrmojo._HasWaitIcon",
        "mstrmojo._IsSelectorTarget",
                         "mstrmojo._IsPanelStack",
                         "mstrmojo._HasBuilder",
                         "mstrmojo.array");
    
    /**
     * Updates the selectedIdx property of mstrmojo.DocPanelStack. It does so by checking the selectedKey of the current panel stack.
     * 
     * @param {mstrmojo.DocPanelStack} ps The panel stack widget
     * @param {Integer} dir The direction (if any) we want to update the selected index by (1 for Next and -1 for Previous)
     */
    function updateSelectedIndex(ps, dir) {
        // Get current panel index
        var idx = mstrmojo.array.find(ps.node.data.panels, 'k', ps.selectedKey);
        
        // Account for the direction we're moving...
        idx += (dir || 0);

        //update and trigger events to show new panel
        ps.set('selectedIdx', idx); //set to update auto-selector button status
    }
    
    /**
     * Updates the navigation properties of the panel stack widget. The properties store whether the panel stack has a next or previous 
     * panel. It does so by checking the selectedIdx property of the panel stack.
     * 
     * @param {mstrmojo.DocPanelStack} ps The panel stack widget.
     */
    function updatePSNavigationProps(ps) {
        ps.set('hasNextPanel', (ps.selectedIdx < (ps.node.data.panels.length - 1)));
        ps.set('hasPreviousPanel', (ps.selectedIdx > 0));
    }
    
    /**
     * A report services document panel stack.
     * 
     * @class
     * @extends mstrmojo.Container
     */
    mstrmojo.DocPanelStack = mstrmojo.declare(

        mstrmojo.Container,
        

        [ mstrmojo._Formattable, mstrmojo._HasWaitIcon, mstrmojo._IsSelectorTarget, mstrmojo._HasBuilder, mstrmojo._IsPanelStack ],

        
        /**
         * @lends mstrmojo.DocPanelStack.prototype
         */
        {
            scriptClass: "mstrmojo.DocPanelStack",
            
            markupString: '<div id="{@id}" title="{@tooltip}" class="mstrmojo-DocPanelStack {@cssClass}" style="{@domNodeCssText}">' +
                            '<div></div>' +
                          '</div>',
                        
            markupSlots: {
                containerNode: function () { return this.domNode.firstChild; }
            },
            
            formatHandlers: {
                domNode: [ 'RW', 'B', 'overflow']
            },
            
            /**
             * Stores whether the panel stack has a next panel.
             * 
             * @type boolean
             * @default false
             */
            hasNextPanel: false,
            
            /**
             * Stores whether the panel stack has a previous panel.
             * 
             * @type {Boolean}
             * @default false
             */
            hasPreviousPanel: false,
            
            /**
             * Stores whether the apply now button should be enabled
             * 
             * @type {Boolean}
             * @default false
             */
            applyEnabled: false,
            
            /**
             * Delay child render until the panel is visible.
             * 
             * @ignore
             */
            renderMode: 'onshow',
            
            init: function init(props) {
                this._super(props);
                
                //initialize selectedIdx to update panel switching toolbar button status
                updateSelectedIndex(this);
                
                // Set flag to show panel-switching toolbar.
                this.node.sw = (this.node.data.panels.length > 1 && this.defn.sw);
            },
            
            /**
             * Panels are hidden by default so we need to set the visibility of the current panel to true.
             * 
             * @ignore
             * @see mstrmojo.Container
             */
            addChildren: function ac(panels, idx, silent){
                var i = 0,
                    cnt = panels.length;
                
                this._super(panels, idx, silent);
                
                // Iterate panels.
                for (; i < cnt; i++) {
                    var pnl = panels[i],
                        isSelected = (pnl.k === this.selectedKey);
                    
                    // Set panel visibility.
                    pnl.selected = pnl.visible = isSelected;
                    
                    // Is this the selected panel?
                    if (isSelected) {
                        // Yes, so break since we have reached the selected panel.
                        break;
                    }
                } 
                
                return true;
            },
            
            /**
             * Overridden to show (and hide) the current (and last visible) panel.
             * 
             * @ignore
             */
            onselectedKeyChange: function onselKeyChg(evt) {
                // Call super to get info object with "on" and "off" panels.
                var panelInfo = this._super(evt),
                    vizProp = 'visible',
                    on = panelInfo.on;
                
                // Does the new panel need to be refreshed?
                if (on._delayRefresh) {
                    // Refresh child and clear flag.
                    on.refresh();
                    delete on._delayRefresh;
                }
                
                // Show the new panel.
                panelInfo.on.set(vizProp, true);
                
                // Hide the old panel.
                panelInfo.off.set(vizProp, false);
                
                // Get current panel index
                updateSelectedIndex(this);
            },
            
            /**
             * <p>Selects the next (or previous) panel based on the value of the dir parameter.</p>
             * 
             * @param {Integer} dir Direction -1 to switch to previous panel, +1 to switch to the next panel. 
             */
            switchToPanel: function switchToPanel(dir) {
                // Update the current panel index.
                updateSelectedIndex(this, dir);

                this.selectPanel(this.children[this.selectedIdx].k); // Load new panel

//                // Select new panel (default to 0 if direction fails).
//                this.selectPanel(this.children[Math.max(0, mstrmojo.array.find(this.children, 'k', this.selectedKey) + dir)].k);
            },
            
            /**
             * Callback for when the 'selectedIdx' property changes
             */
            onselectedIdxChange: function onselectedIdxChange() {
                //Update the panel stack navigation properties
                updatePSNavigationProps(this);
            },
            
            /**
             * @object
             */
            _bufferedSlices: null,
            
            bufferSlice: function(rEvt){
                this._bufferedSlices = this._bufferedSlices || {};
                var bs = this._bufferedSlices;
                
                // We shall disable the apply button for 2 conditions:
                // 1. no selection change
                // 2. any of selector has empty selection                     
                if (rEvt.ctlKey) {
                    bs[rEvt.ctlKey] = rEvt;
                    this.set('applyEnabled', true);   //1
                }
                             
                var evt;
                for(var i in bs){
                    evt = bs[i];
                    if (evt.eid == '') { 
                        this.set('applyEnabled', false);    //2
                    } 
                }

            },
            
            applyBufferedSlices: function(){
                var bs = this._bufferedSlices;
                
                if(!bs){
                    return;
                }
                
                var m = this.model,
                    s = mstrmojo.Serializer,
                    evt,
                    evta,
                    i,
                    events = [];
                
                for(i in bs){
                    evt = bs[i];
                    if ('eid' in evt) {
                        evta = [2048084,'mstrWeb.rwb.2048084',
                                'selectorKeyContext',  evt.ck, 
                                'elemList', evt.eid, 
                                'ctlKey', evt.ctlKey,
                                'applyNow', false];
                        
                        if (evt.include !== null && evt.include !== undefined){
                            evta.push('include');
                            evta.push(evt.include);
                        }
                        
                        if (evt.disablePU){
                            evta.push('usePartDisplay');
                            evta.push(0);
                            evta.push('treesToRender');
                            evta.push(3);                        
                        } else {
                            evta.push('usePartDisplay');
                            evta.push(1);
                            evta.push('treesToRender');
                            evta.push(2); 
                        }
                    } else {
                        if ('srct' in evt && evt.srct === 4) {//metric condition selector)
                            evta = [2048132,'mstrWeb.rwb.2048132',
                                    'unitKeyContext',  evt.ck, 
                                    'ctlKey', evt.ctlKey,
                                    'objectID', evt.srcid,
                                    'objType', evt.srct,
                                    'expFunction', evt.f,
                                    'expFunctionType', evt.ft,
                                    'applyNow', false,
                                    'usePartDisplay', 1]; 
                            
                            if (evt.cs) {
                                evta.push('expConstants');
                                evta.push(evt.cs);
                                evta.push('dataType');
                                evta.push(evt.dtp);
                            }                            
                        } else if(evt.unset){
                            evta = [2048128,'mstrWeb.rwb.2048128',
                                    'unitKeyContext',  evt.ck, 
                                    'ctlKey', evt.ctlKey];                                
                        } else {
                            evta = [2048133,'mstrWeb.rwb.2048133',
                                    'include',  evt.include, 
                                    'ctlKey', evt.ctlKey];  
                        }
                    } 
                    

                    if (evta) {
                        events.push(evta);
                    }
                }
                
                events = s && s.serializeValueGroup(events);
                
                this.clearBuffSlices();
                
                m.slice({
                    isMultipleEvents: true, 
                    //TO-DO: currently for filter panel, all selectors target at the same targets, and so we
                    //use the targets for the last event; but we shall somehow find a way for general cases later(concatenating all of them?). 
                    //We need this for wait icon to show up. So put this line back for now. 
                    tks: evt.tks,  
                    events: events
                });
            },
            
            clearBuffSlices: function() {
                //clear the buffered slices
                this._bufferedSlices = null;
                
                //reset the apply button to disabled status
                this.set('applyEnabled', false);                
            }

        }
    );
    
}());