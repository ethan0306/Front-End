(function(){   
    var $ID = "mstrFilterPanelMenu",
        $BOX = "mstrmojo.Box",
        $BOXC = "mstrmojo-Menu-Box",
        $SEGBROWID = "segBrow",
        $D = mstrmojo.desc;

    var fnClearAllFilters = function() {
        var mn = mstrmojo.all[$ID],
        fps = mn.fps;
    if (!fps || !fps.children) {
        return;
    }

    for (var i in fps.children) {
        var pal = fps.children[i]; //each one should be a DocPanel widget
        if (!pal.children) {
            continue;
        }           
        for (var j in pal.children) {
            var s = pal.children[j]; //each one should be a DocPortlet widget 
            
            if (typeof(s.defn.ttl) != 'undefined'){
                s = s.children[1];
            }
            
            if (s.model) {
                var evt = {
                    tks: s.tks,
                    ck: s.ck,
                    ctlKey: s.ckey,
                    unset: true
                };
                
                fps.bufferSlice(evt);
                
                // set the selector to unset state
                s.node.data.ces = [];
                s.node.defn.cek = null;
                
                if(s.node.defn.style == mstrmojo.DocSelectorViewFactory.STYLES.SEARCH_BOX){
                    s.content.set('items', []);
                }
                
                s.update(s.node);
                s.refresh();
            }
        }
    }
    fps.applyBufferedSlices();//Apply all the unset in one event
    
    mn.close();    	
    };
    
    var fnApplyBufferedSlices = function(){
        var mn = mstrmojo.all[$ID],
            fps = mn.fps;
        
        if (fps && fps.applyBufferedSlices) {
            fps.applyBufferedSlices();
        }
        
        mn.close();
    };

    
    var fnOpenSegmentSaveAs = function() {
    	var mn = mstrmojo.all[$ID],
        fps = mn.fps;
    	
    	mstrmojo.loader.load('mstrmojo.SegmentSaveAs');
    	
		var seg = mstrmojo.insert({
			scriptClass: 'mstrmojo.SegmentSaveAs',
			fps: fps
		});
	
		seg.open();
		mn.close();
    };
    
    var fnOpenSegmentBrowser = function() {
    	var seg = mstrmojo.all[$SEGBROWID],
    		mn =  mstrmojo.all[$ID],
    		fps = mn.fps;
    	
    	if (!seg) {
        	mstrmojo.loader.load('mstrmojo.SegmentBrowser');
    		
    		seg = mstrmojo.insert({
    			scriptClass: 'mstrmojo.SegmentBrowser',
    			id: $SEGBROWID,
    			folderLinksContextId: 25,
    			browsableTypes: 259,
    			fps: fps
    		});
		}

		if (seg) seg.open();
		mn.close();
    };
    
    var fnCollapseAll = function() {
        _dsChangeAll(false);
    };
    
    var fnExpandAll = function() {
        _dsChangeAll(true);
    };
    
    function _dsChangeAll(bExpd) {
        var mn = mstrmojo.all[$ID],
            fps = mn.fps;
        if (!fps || !fps.children) {
            return;
        }

        for (var i in fps.children) {
            var pal = fps.children[i]; //each one should be a DocPanel widget
            if (!pal.children) {
                continue;
            }           
            for (var j in pal.children) {
                var s = pal.children[j]; //each one should be a DocPortlet widget 
                
                if (typeof(s.defn.ttl) != 'undefined'){
                    var f = bExpd ? 'onexpand' : 'oncollapse';
                    s[f]();                   
                }                
            }
        }
        mn.close();        
    }
    
    /**
     * Helper function to create filter panel menu buttons.
     * 
     * @param {String} t The text to display in the button.
     * @param {Function} clkFn The function to execute when the button is clicked.
     * @param {Object} bds An optional collection of bindings for this button.
     * 
     * @returns Object The menu button config.
     * @private
     */
    function createFPMnBtn(t, clkFn, bds) {
        var btn = {
            scriptClass: 'mstrmojo.MenuItem',
            text: t,
            cssClass: 'mstrmojo-InteractiveButton',
            onclick: clkFn,
            bindings: bds
        };
        
        return btn;
    }
       
    /**
     * The popup config for the filter panel {@link mstrmojo.DocPanelStack} popup menu.
     * This popup menu is trigger by clicking on the pulldown button on Selector's Titlebar.
     * 
     * @type mstrmojo.Popup
     */
    mstrmojo.FilterPanelMenu = mstrmojo.registry.ref({
        id: $ID,
        slot: "popupNode",
        scriptClass: "mstrmojo.Popup",
        cssClass: "mstrmojo-Menu",
        shadowNodeCssClass: "mstrmojo-Menu-shadow",
        contentNodeCssClass: "mstrmojo-Menu-content",
        locksHover: true,
        onOpen: function onOpen(){
            // Position this popup below the given button.
            var el = this.openerButton.domNode,
                op = this.opener,
                diff = mstrmojo.boxmodel.offset(el, op && op[this.slot]),
                x = diff.left,
                y = diff.top + ((el && el.offsetHeight) || 0);
            
            this.set("left", x + "px");
            this.set("top", y + "px");
        },
        
        children: [{
            scriptClass: $BOX,
            bindings: {
            },
            cssClass: $BOXC,
            children: [ 
                createFPMnBtn(mstrmojo.desc(8974, 'Clear all filters'), fnClearAllFilters, {}),
                /*
                createFPMnBtn('Save segment as...', fnOpenSegmentSaveAs, {}),
                createFPMnBtn('Load segment...', fnOpenSegmentBrowser, {}),
                */
                createFPMnBtn('Apply Now', fnApplyBufferedSlices, 
                    {visible: "!mstrmojo.all['" + $ID + "'].fps.defn.cas",
                     enabled: "mstrmojo.all['" + $ID + "'].fps.applyEnabled"
                    })
            ] 
            },{
            scriptClass: $BOX,
            cssClass: $BOXC,
            bindings: {                
            },
            children: [ 
                createFPMnBtn(mstrmojo.desc(8970, 'Expand all'), fnExpandAll, {}),
                createFPMnBtn(mstrmojo.desc(8971, 'Collapse all'), fnCollapseAll, {})
            ] 
        }]
    });
}());