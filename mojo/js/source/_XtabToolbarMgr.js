(function() {
    
    mstrmojo.requiresCls( "mstrmojo.Model" );    

    //set up context menu buttons, copied and modified from XtabCellMenu.js
    var $ID = "iPadNav";
    var $SD = "mstrmojo.all['" + $ID + "'].selectedData";
    var $XT = "mstrmojo.all['" + $ID + "'].xtab";    
    
    function fnClick(mth, args) {
        var p = mstrmojo.all[$ID],
        xtab = p.xtab,
        newArgs = [ p.selectedData ].concat(args || []);
    
        // close toolbar
        if(p._closeToolbar) {
            p._closeToolbar();
        }
    
        xtab.feedbackMsg = "Grid is <span style='color:#ffff00'>" + mth + "ed</span> on <span style='color:#66ff33;font-weight:bold;'>" + (p.selectedData.n || p.selectedData.v) + "</span>";
        
        xtab[mth].apply(xtab, newArgs);
    }
    
    function createButton(t, fn, cn) {
        var b = {
            scriptClass: "mstrmojo.Button",
            cssClass: cn || '',
            text: t,
            onclick: fn
        };
        return b;
    }
    
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
    
    function createLinkButton() {
        return {
            // ListBox for hyperlinks.
            scriptClass: "mstrmojo.SelectBox",
            cssClass: "mstrmojo-ipad-selectBox",
            autoHide: true, 
            onSelectionChange: function(evt) {
                console.log("change");
                this._super(evt);
                fnClick('link', [this.index]);
            },
            bindings: {
                itemsInfo: "this.parent.visible ? " + $XT + ".model.getCellLinksInfo(" + $SD + ") : null",
                items: "this.itemsInfo.links"
            }
        };        
    }
    
    mstrmojo._XtabToolbarMgr = mstrmojo.declare(
            mstrmojo.Model, 
            null,
            {
                scriptClass: "mstrmojo._XtabToolbarMgr",
                /**
                 * Reference to the Xtab instance
                 */
                parent: null,
                /**
                 * Reference to the last selected cell
                 */
                td: null,               
                
                showToolbar: function(td) {
                    this.td = td;
                    
                    // get ipadNavigator
                    var tb = mstrmojo.all[$ID];
                    // clear selected cell css
                    if(tb.objHilited) {
                        var ls = tb.objHilited;
                        mstrmojo.css.removeClass(ls, "mstrmojo-ipad-selected");
                    }
                    // set selected celll
                    mstrmojo.css.addClass(td, "mstrmojo-ipad-selected");
                    tb.objHilited = td;
                    
                    // store xtab and selected cell info to ipadNavigator instance
                    var xtab = tb.xtab = this.parent;
                    var data = tb.selectedData = xtab && td && xtab.getCellForNode(td);
                    
                    if(!tb.btns) {
                        tb.btns = [createSortButton('', 'true', 'sortAscBtn'), //sort buttons 
                                   createSortButton('', 'false', 'sortDescBtn'),
                                   
                                   createPivotButton('', '2', 'pcolBtn'), //pivot buttons
                                   createPivotButton('', '1', 'prowBtn'),
                                   createPivotButton('', 'l', 'pleftBtn'),
                                   createPivotButton('', 'r', 'prightBtn'),
                                   createPivotButton('', 'u', 'pupBtn'),
                                   createPivotButton('', 'd', 'pdownBtn'),
                                   
                                   createLinkButton()]; //link button
                    }
                    
                    var btns = [];
                    btns.push(tb.btns[0]);
                    btns.push(tb.btns[1]);
                    
                    //add pivot button
                    var pVis = ((data && data.at) || 0) & 16;        // 16 = PIVOT_ACTION
                    if (pVis) {
                        // Iterate pivot buttons.
                        for (var i = 0; i < 6; i++) {
                            var c = tb.btns[i+2];
                            if(xtab.model.isPvtButtonVisible(data, c.bid)) {
                                btns.push(c);
                            }
                        }
                    }                        
                    
                    if(((data && data.at) || 0) & 4) {
                        btns.push(tb.btns[8]);
                    }
                    
                    //high light sort button                    
                    var prefix = (mstrmojo.dom.isWinPhone) ? '' : '-webkit-';
                    var cssShadow = prefix + 'box-shadow: 1px 1px 3px white';
                    
                    if((data && data.so) === true) {
                        tb.btns[0].enabled = false;
                        tb.btns[1].enabled = true;
                        tb.btns[0].cssText = cssShadow;
                        tb.btns[1].cssText = "";
                    } else if((data && data.so) === false) {
                        tb.btns[0].enabled = true;
                        tb.btns[1].enabled = false;                            
                        tb.btns[0].cssText = "";
                        tb.btns[1].cssText = cssShadow;
                    } else {
                        tb.btns[0].enabled = true;
                        tb.btns[1].enabled = true;
                        tb.btns[0].cssText = "";
                        tb.btns[1].cssText = "";
                    }                        
                    
                    mstrmojo.all[$ID].showToolbar({
                        buttons: btns,
                        iconClass: 'tbGridIcon'                       
                    });                        
                                        
                },
                
                startup: function startup() {
                    // todo: dynamically attach touch event listener?
                },
                
                shutdown: function shutdown() {                    
                }
                
            });
})();