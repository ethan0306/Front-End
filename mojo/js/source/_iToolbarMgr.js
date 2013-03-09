(function(){
   
    mstrmojo.requiresCls("mstrmojo.VBox",
                         "mstrmojo.Container",
                         "mstrmojo.Model" );
    
    //set up context menu buttons, copied and modified from XtabCellMenu.js
    var $ID = "iToolbar";
    
    /*
    function fnClick(mth, args) {
        var p = mstrmojo.all[$ID],
        xtab = p.xtab,
        newArgs = [ p.selectedData ].concat(args || []);
    
        // close toolbar
        if(p.hideToolbar) {
            p.hideToolbar();
        }
    
        xtab.feedbackMsg = "Grid is <span style='color:#ffff00'>" + mth + "ed</span> on <span style='color:#66ff33;font-weight:bold;'>" + (p.selectedData.n || p.selectedData.v) + "</span>";
        
        xtab[mth].apply(xtab, newArgs);
    }
    */
    
    function createButton(t, cmd, fn, cn) {
        var b = {
            scriptClass: "mstrmojo.Button",
            cssClass: (cn || '') + ' iToolbar-Button',
            text: t,
            cmd: cmd,
            onclick: fn
        };
        return b;
    }
    
    /*
    function createSortButton(t, b, cn) {
        var btn = createButton(t, function(){
            fnClick('sort', [(b==='true')]);
            return false;
        }, cn);
        return btn;
    }
    
    function createPivotButton(t, id, cn) {
        var btn = createButton(t, function() {
            fnClick('pivot', [id]);
            return false;
        }, cn);
        btn.bid = id;
        return btn;
    }    
    */
    
    
    mstrmojo.FloatingToolbar = mstrmojo.declare(
        mstrmojo.Container,
        null,
        {
            scriptClass: "mstrmojo.FloatingToolbar",
            
            markupString: '<div class="mstrmojo-callout">' + 
                            '<div class="graphics">' +
                                '<div class="arrow"><img src="calloutTip.png" height="21" width="36" /></div>' +
                            '</div>' +  
                            '<div class="content">' +
                            '</div>' +  
                        '</div>',

            markupSlots: {
                arrowNode: function() { return this.domNode.firstChild.firstChild; },
                barNode: function() { return this.domNode.lastChild; }
            },  
            
            markupMethods: {
                onvisibleChange: function(){ this.domNode.style.display = (this.visible) ? 'block' : 'none'; }
            },  
            
            postBuildRendering: function postBuildRendering() {
                if(!this.attached) {
                    document.body.appendChild(this.domNode);
                    this.attached = true;
                }
                this._super();
            },
            
            unrender: function() {
                document.body.appendChild(this.domNode);
                this.attached = false;
            },
            
            showToolbar: function(toolbarBtns, pos) {
                if(this.visible === false) {
                    this.set('visible', true);
                }
                
                var toolbar = this.toolbar = new mstrmojo.VBox({slot: 'barNode', children: toolbarBtns});
                this.addChildren(toolbar);

                this.render();
                
                var ws = document.body.clientWidth,
                    tbWidth = this.domNode.clientWidth,
                    domNode = this.domNode.style;
                
                // Calculate top position.
                domNode.top = (pos.top + pos.height + 20) + 'px';
                
                var left = (pos.left - tbWidth / 2 + pos.width / 2),
                    gutter = 10;
                if (left < gutter) {
                    left = gutter;
                } else if (left > ws - tbWidth - gutter) {
                    left = ws - tbWidth - gutter;
                }
                
                var arrow = this.arrowNode,
                    aWidth = arrow.offsetWidth;
                
                arrow.style.marginLeft = Math.max(gutter, Math.min(pos.left + pos.width / 2 - left - aWidth / 2, tbWidth - aWidth - gutter)) + 'px';
                domNode.left = left + 'px';
                
                window.setTimeout(function() {
                    domNode.opacity = 1;
                }, 0);
                
                this.isOpen = true;
            },
            
            hideToolbar: function() {
                var tb = this.toolbar;
                this.domNode.style.opacity = 0;
                var me = this;
                window.setTimeout(function(){
                    me.removeChildren(tb);
                    tb.destroy();
                }, 300);
                this.isOpen = false;
            }
            
            
        }
    );
    
    mstrmojo.iToolbar = mstrmojo.registry.ref({
        id: $ID,
        scriptClass: "mstrmojo.FloatingToolbar"
    });    
    
    mstrmojo._iToolbarMgr = mstrmojo.declare(
        mstrmojo.Model, 
        null,
        {
            scriptClass: "mstrmojo._iToolbarMgr",
            /**
             * Reference to the Xtab instance
             */
            parent: null,
            /**
             * Reference to the last selected cell
             */
            td: null,               
            
            closeToolbar: function() {
                var tb = mstrmojo.all[$ID];
                
                if(tb && tb.isOpen) {
                    tb.hideToolbar();
                }                
            },
            
            showToolbar: function(td, actions, xtab) {
                this.td = td;
                
                // get ipadNavigator
                var tb = mstrmojo.all[$ID];
                
                if(tb.isOpen) {
                    tb.hideToolbar();
                }
                
                // store xtab and selected cell info to ipadNavigator instance
                tb.xtab = xtab;
                var btns = [],
                    fnClick = function () {
                    var splitCmd = this.cmd.split('|'),
                    group = parseInt(splitCmd[0], 10),
                    command = splitCmd[1];
                        xtab.handleMenuItem(group, command);
                    };                
                    
                for(var i = 0, iLen = actions.length; i < iLen; i++) {
                    var acn = actions[i];
                    if(acn.on) {
                        var bns = acn.btns;
                        for(var j = 0, jLen = bns.length; j < jLen; j++) {
                            var btn = bns[j];
                            if(btn.on) {
                                var cmd = acn.act + '|' + btn.act;
                                btns.push(createButton(btn.lbl, cmd, fnClick, btn.chk));
                            }
                        }
                    }
                }
                
                var ofst = mstrmojo.boxmodel.offset(td, document.body),
                    lzw = xtab._BL.clientWidth || 0;
                
                // get the absolute position of the selected td
                if( (lzw > 0 && ofst.left >= lzw) || !lzw ) {
                    ofst.left -= xtab._scroller.x[0].origin.x;
                }
                ofst.width = td.clientWidth || 40;
                ofst.height = td.clientHeight || 15;
                
                mstrmojo.all[$ID].showToolbar(btns, ofst);                        
                                    
            },
            
            startup: function startup() {
                // todo: dynamically attach touch event listener?
            },
            
            shutdown: function shutdown() {                    
            }
            
        });    
})();