(function () {
    mstrmojo.requiresCls("mstrmojo.dom");

    /**
     * String constant for toolbar css 
     */
    var FLOATING_TB_CSS = "mstrmojo-floating-toolbar-lightbox";
    var FLOATING_BAR_CSS = "mstrmojo-floating-toolbar";
    var FLOATING_CELL_CSS = "mstrmojo-floating-toolbar-cell";

    var FIXED_TB_CSS = "mstrmojo-fixed-toolbar-lightbox";
    var FIXED_BAR_CSS = "mstrmojo-fixed-toolbar";
    var FIXED_CELL_CSS = "mstrmojo-fixed-toolbar-cell";    
    
    var CTN_CSS_SUFFIX = " hasToolBar";
    var BTN_CSS_PREFIX = "mstrmojo-Button mstrmojo-InteractiveButton mstrmojo-oivmSprite ";
    var BTN_CNT_CSS = "mstrmojo-Button-text";
        
    var SL = 27; //Space limit between the widget to its container
    
    /**
     * <p>A mixin for {@link mstrmojo.Widget}s that needs floating toolbar.</p>
     * 
     * <p>This mixin would decorate existing component with extra functionality.
     * Implementation detail: The mixin would first obtain a json object from the widget which needs a floating toolbar.
     * Then it creates a floating toolbar with interactive items in it. Once the onclick event is triggered, the toolbar
     * would find the proper widget to invoke a callback method.
     * </p>
     * 
     * @class
     * @public
     */
    mstrmojo._HasToolbar =
    /**
     * @lends mstrmojo._HasToolbar#
     */
    {
        /**
         * the name to identify this mixin. Required by mstrmojo.DynamicClassFactory
         */
        _mixinName: 'mstrmojo._HasToolbar',
        

        /**
         * Creates the toolbar, sets each button, and docks it above the container 
         * @ignore
         */
        postBuildRendering: function TB_postBuildRendering() {        
            this._super();
            
            var tb = this.getToolbarCfg();
            
            // If we don't have the json object for toolbar, or the widget has title bar then we don't do anything. 
            if(!tb || this.defn.ttl) {
                return;
            }
            
            // Create the floating toolbar and attached it to its container
            var cn = this.containerNode;
            if(cn) {                
                // Get the toolbar dom object
                var d = this._createToolbar(FLOATING_BAR_CSS, FLOATING_CELL_CSS);
                
                // Set the css of the toolbar to be floating one
                d.className = FLOATING_TB_CSS;
                // Append the css suffix to the css of the container
                cn.className += CTN_CSS_SUFFIX;
                
                // Insert the dom object before the first child of the container
                cn.insertBefore(d, cn.firstChild);
                
                var dm = this.domNode,
                    ofst = mstrmojo.boxmodel.offset(dm, this.parent && this.parent.domNode); 

                // Creates a floating toolbar. Normally, the toolbar will flow above its container widget. 
                // If the space between the container widget to its outside container is too narrow, smaller than the toolbar height 24, 
                // the toolbar would be shifted a few pixels down in order to get displayed preperly
                if(ofst.top < SL) {
                    d.style.top = (SL - ofst.top) + 'px';
                }
            }
        },
        
                
        /**
         * Creates the toolbar dom object.
         */
        _createToolbar: function TB_addBtns(barCss, btnCss) {            
            var tb = this.getToolbarCfg(),
                me = this,            
                d = document,
                dv = d.createElement('div'),
                tbl = d.createElement('table'),
                tr = d.createElement('tr'),
                td = d.createElement('td');
            
            dv.appendChild(tbl);

            // Creates the toolbar in the table            
            tbl.className = barCss;
            td.className = btnCss;
            tr.appendChild(td);
            tbl.appendChild(tr);
            
            // Go though the toolbarCfg object to create each toolbar item
            
            // Each toolbarCfg item has two properties: css and callback.
            // The css array is used to set the toolbar button outlook. Once the clicking action is
            // executed successfully, the button css will switch to the next one indicating that the 
            // button status is changed.
            
            // The callback string is set to response what action to take when the button is clicked.
            // It will invoke the callback function from the container who creates the toolbarCfg object.
            
            for(var i in tb) {
                var div = d.createElement('div');
                div.className = BTN_CSS_PREFIX + tb[i].css[0];
                
                var cnt = d.createElement('div');
                cnt.className = BTN_CNT_CSS;
                cnt.nodeValue = "&nbsp;";
                
                // Set the div attribute to remember which icon is clicked (ix), and 
                cnt.setAttribute("ix", i);
                
                // for the given icon, which styls (css index) is being used. 
                cnt.setAttribute("cix", 0);

                div.appendChild(cnt);                
                td.appendChild(div);

                div.onclick = function(e) {
                    me.onClick(e);
                };
            }
            
            return dv;

        },
        
        
        /**
         * Creates a fixed toolbar docking inside the give slot. This method should normally be called from title bar. 
         * 
         * @param slot DOMNode
         */
        renderToolbar: function TB_rndToolbar(slot) {
            if(!this.getToolbarCfg()) {
                // return if there is no toolbar cfg object
                return;
            }
            
            var fc = slot.firstChild,
                tb = this._createToolbar(FIXED_BAR_CSS, FIXED_CELL_CSS);
            
            tb.className = FIXED_TB_CSS;
            
            if(fc) {
                slot.insertBefore(tb, fc);
            } else {
                slot.appendChild(tb);
            }
        },
    
        
        /**
         * Handles the case when the toolbar button is clicked. When the button is clicked,
         * we will execute the corresponding callback function on the container widget
         */
        onClick: function TB_clk(/*DomEvent?*/ e, /*DomWindow?*/ hWin) {
            
            var d = mstrmojo.dom,
                b = d.eventTarget(hWin, e),
                cix = b.getAttribute("cix"),
                ix = b.getAttribute("ix");            
            
            var tb = this.toolbarCfg[ix],
                tbFn = tb.callback;
            
            if(tbFn && this[tbFn] && this[tbFn]()) { 
                //we need to cycle thru to the next css
                cix = ++cix % tb.css.length; 
                b.parentNode.className = BTN_CSS_PREFIX + tb.css[cix];
                b.setAttribute("cix", cix);
            }
        }

    };
})();