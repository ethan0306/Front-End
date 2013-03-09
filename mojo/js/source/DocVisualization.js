/*global mstrmojo:false, window:false, document:false */
/*jslint forin: true, undef: true, browser: true, newCap: true */

(function(){
    var regExH = /"height", "[0-9.]+"/g;
    var regExW = /"width", "[0-9.]+"/g;
    var regExH1 = /height="?[0-9.]+"?/g;
    var regExW1 = /width="?[0-9.]+"?/g;
    
    mstrmojo.requiresCls("mstrmojo.Widget", 
                         "mstrmojo._Formattable",
                         "mstrmojo._IsSelectorTarget");
    
    /**
     * <p>The widget for custom Visualization.</p>
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     */
    mstrmojo.DocVisualization = mstrmojo.declare(
        // superclass
        mstrmojo.Widget,
        
        // mixins,
        [mstrmojo._Formattable, mstrmojo._IsSelectorTarget],
        
        // body
        {
            scriptClass: "mstrmojo.DocVisualization",

            markupString:   '<div id={@id} class="mstrmojo-docvisualization" title="{@tooltip}" style="{@domNodeCssText}">{@htmlText}</div>',
            
            formatHandlers: {
                domNode: [ 'RW', 'T', 'B', 'fx']
            },
                            
            /**
             * Updates the DocVisulaization
             * 
             * @param {Object} node The widget node.
             */
            update: function update(node) {
                if (this._super) {
                    this._super(node);
                }
                
                var d = node.data;
                this.htmlText = d.htmlText;
                this.jsText = d.jsText;
                this.selData = d.selData;
                this.ctrLink = d.ctrLink;
                this.vp = d.vp;
            	this.eg = d.eg;
            	
            	if (this.eg) {
            		this.htmlText = this.eg;
            	}
            },
            
            preBuildRendering: function () {
                if (this._super) {
                    this._super();
                }
                var fmts = this.getFormats();
                if (!fmts) {
                    return;
                }
                var h = fmts.height;
                if (h) { 
                    h = h.replace('px','');
                }
                var w = fmts.width;
                if (w) {
                    w = w.replace('px','');
                }
                if (this.jsText) {
                    this.jsText = this.jsText.replace(regExH, '"height", "' + h + '"').replace(regExW, '"width", "' + w + '"');
                }
            },
            
            postBuildRendering: function pstBldRnd(){
                if (this._super) {
                    this._super();
                }
                
                eval(this.jsText);

            }, 
            
            resize: function () {
                if (this.eg) {
                    //It's an empty grid.
                    return;
                }
                var embedNode = this.domNode.firstChild.firstChild.firstChild;
                if (!embedNode) {
                    return;
                }
                var fmts = this.getFormats();
                var h = fmts.height;
                if (h) {
                    h = h.replace('px','');
                }
                var w = fmts.width;
                if (w) {
                    w = w.replace('px','');
                }
                if(mstrmojo.dom.isIE){ //449799
                    embedNode.firstChild.setAttribute("height", h);
                    embedNode.firstChild.setAttribute("width", w);
                }else{
                    embedNode.innerHTML = embedNode.innerHTML.replace(regExH1, 'height="' + h + '"').replace(regExW1, 'width="' + w + '"');
                }

            },
            
            makeSelections: function (selections) {
                var shuffledData = {},
                    i, j, attId, e;
                
                // Joining the element ids
                for (i = 0; i < selections.length; i++) {
                    var attIdI = selections[i].attId;
                    if (!shuffledData[attIdI]) {
                        shuffledData[attIdI] = [];
                    }
                    shuffledData[attIdI] = shuffledData[attIdI].concat(selections[i].values);    
                }

                var sep = '\u001E',
                    sep1 = ',';
                var ckJoined = '',
                    eidJoined = '',
                    cklJoined = '';
                var tksArray = [];
                for (attId in shuffledData) {
                
                    var sd = this.getSelectionData(attId);
                    if (!sd) {
                    	// TQMS 447130, certain widgets will pass down non-selectors 
                    	continue;
                    }
                    var ctrLink = this.ctrLink[attId];
                    var values = shuffledData[attId];

                    if (sd && values && values.length>0) { 
                        // update client-side selectionData as this bone is not getting re-rendered
                        sd.sel = values;
                        sd.ias = false;
                        for (e in values) {
                            if (e === "u;") {
                                sd.ias = true; // update client-side selectionData as this widget is not getting re-rendered
                                break;
                            }
                        }
                    }
                    // TQMS 444885, sometimes we use "gbTargets" instead of "targets"
                    if (ctrLink.gbTargets) {
                        var t = ctrLink.targets = [],
                            gbt = ctrLink.gbTargets,
                            cgbmap = this.model.getCGBMap();
                        for(j = 0; j < gbt.length; j++) {
                            var targetKey = cgbmap[gbt[j]];
                            if (targetKey) {
                                t.push(targetKey);
                            }
                        }
                        delete ctrLink.gbTargets;
                    }
                    ckJoined += ctrLink.ctxt + sep1;
                    eidJoined += values.join(sep) + sep1;
                    cklJoined += ctrLink.ck + sep1;
                    tksArray = tksArray.concat(ctrLink.targets);

                } // for (var attId in shuffledData) 
                
                // trimming the ending separator ","
                ckJoined = ckJoined.substring(0, ckJoined.length-1);
                eidJoined = eidJoined.substring(0, eidJoined.length-1); 
                cklJoined = cklJoined.substring(0, cklJoined.length-1);
                var evt = {
                        ck: ckJoined,
                        eid: eidJoined,
                        src: this.k,
                        tks: tksArray.join(sep),
                        type: this.defn.t,
                        ctlKey: cklJoined,
                        include: true
                    };
                this.model.slice(evt);
            },
            
            getAllSelectionData: function () {
                return this.selData;
            },
            
            getSelectionData: function (attId) {
                var selData = this.selData,
                    k;
                
                if (selData && selData.attl){
                    var attl = selData.attl;
                    if (attId) {
                        return attl[attId];
                    }
                    else {
                        for (k in attl) {
                            // no attID, return the first one
                            return attl[k];
                        }
                    }
                }
            }
        }
    );
}());