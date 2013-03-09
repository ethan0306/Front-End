(function() {

	var prevWidth,
		prevHeight;

	mstrmojo.requiresCls("mstrmojo.Container");
    
    /**
     * A visualization control
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.Vis = mstrmojo.declare(

        // superclass
        mstrmojo.Container,

        // mixins
        [mstrmojo._HasLayout],    
        
        /**
         * @lends mstrmojo.Vis.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: 'mstrmojo.Vis',
            
            offsetTop:0, 
            
            offsetLeft:0,
            
            isAndroid: window.navigator.userAgent.indexOf('Android') != -1,
            
            updated: false,
                
            reRenderOnDimensionChg: true,
                
            getFormats: function() {
                // this is called when rendering a document on Express Mode
                return this.fmts;
            },
            
            setModel: function setModel(model) {
                // this is called in android
				if (model.data) this.set('model', model.data);       
            	this.xtabModel = model;
            },

            destroy: function destroy() {
            	this._super();
            	
            	var xtab = this.xtabModel;
            	if(xtab && xtab.destroy) {
            		xtab.destroy();
            	}
            	
            },
            
            setDimensions: function setDimensions(h, w) {
            	var dimensionChanged = this._super(h, w);
            	if (dimensionChanged && this.hasRendered && this.reRenderOnDimensionChg ) {
            		this.reRender();
            	}
            	return dimensionChanged;
            },

            reRender: function reRender() {
            	this.unrender();
            	this.render();
            },

            getWidth: function getWidth() {
            	return parseInt(this.width, 10); // remove the px if present
            },
            
            getHeight: function getHeight() {
            	return parseInt(this.height, 10); // remove the px if present
            },

            buildRendering: function bldRn() {

            	if (!this.updated) {
            		this.update();
            	}

            	// Call the inherited method to do the DOM construction.                
            	this._super();  
            },

            postBuildRendering: function postBR(){
            	prevWidth = this.width;
            	prevHeight = this.height;
                
            	this.adjustWidgetOffsets();
            	
            	//call super to have children rendered
            	this._super();            	
            },
            
            adjustWidgetOffsets: function adjustWidgetOffsets() {
                var dn = this.domNode,
                    offset = {
                        top: 0,
                        left: 0
                    };
                
                if (typeof(mstr) != 'undefined') {
                    offset.top = mstr.utils.BoxModel.getElementSumOffsetTop(dn);
                    offset.left = mstr.utils.BoxModel.getElementSumOffsetLeft(dn);
                } else if (typeof(mstrmojo) != 'undefined') {
                    offset = mstrmojo.boxmodel.offset(dn);
                }
                
                this.offsetTop = offset.top;
                this.offsetLeft = offset.left;
            },
            
        	/**
			 * This function will read the properties defined in vis properties editor and than
			 * set the properties accordingly
			 */
			initFromVisProps: function initFromVisProps(vp) {},
			
            update: function update(node) {
                node = node || this.node;
                if (node) { // called from docs
                	if (node.data) {
                	    this.set('model', node.data)
                		this.model = node.data;
                		if (this.model.layoutModel) this.layoutModel = this.model.layoutModel;
                		if (this.model.layoutNode) this.layoutNode = this.model.layoutNode;
                	}
                    var fmts = node.defn.fmts || node.defn.units[this.model.k].fmts;
                    this.width = fmts.width;
                    this.height = fmts.height;
                    this.left = fmts.left || '0px';
                    this.top = fmts.top || '0px';
                    this.fmts = fmts;
                }

                if (this.model) {
                	this.initFromVisProps(this.model.vp);
                }                
                this.updated = true;
            },
            
            getModel: function getModel(k) {
            	if (k) {
            		var m = mstrmojo.Vis.getVisGrid(this.layoutModel, this.layoutNode, k);
            		if (m) {
            			return m.data;
            		} else {
            			alert(mstrmojo.desc(8427,"Incorrect visualization properties encountered.  Data may be inconsistent.  Please reset your properties."));
            		}
            	} else {
            		return this.model;
            	}
            },

            getDataParser: function getDataParser(key) {
            	return new mstrmojo.Vis.DataParser(this.getModel(key));
            },
            
            /**
             * Renders an error message replacing the entire DOM node
             */
            renderErrorMessage: function renderErrorMessage(msg) {
            	this.domNode.innerHTML = "<div class=\"mstrmojo-message\">" + msg + "</div>";
            }
        }
    );
    
    // find the visualization grid
    mstrmojo.Vis.getVisGrid = function(m /*model*/, n /*node*/, k /*key*/) {
    	var origN = n;
    	var chldn = m.getChildren(n, false);
    	for (var i=0; i < chldn.length; i++) {
    		var c = chldn[i];
    		if (c.k == k) {
    			return c;
    		} else {
    			var g = mstrmojo.Vis.getVisGrid(m, c, k);
    			if (g) {
    				n = origN; // repoint to original object
    				return g;
    			}
    		}
    	}
    };
    
    mstrmojo.Vis.DataParser = function (m /*model*/) {
    	var ns = mstrmojo.Vis;
    	
    	return {
    		getRowTitles: function() {
        		return new ns.Titles(m, true);
        	},
        	
    		getColTitles: function() {
        		return new ns.Titles(m, false);
        	},
        	
        	findMetricValue: function(rvIdx /* an array with the row value indices*/, c /* col value index*/) {
        		var rhs = m.ghs.rhs.items;
        		for (var e in rhs) {
        			var row = rhs[e].items;
        			var found = true;
        			for (var i in rvIdx) {
        				if (rvIdx[i] != row[i].idx) {found = false; break;} 
        			}
        			if (found) {
        				return new mstrmojo.Vis.MetricValue(m.gvs.items[e].items[c]);
        			}
        		}
        	},
        	
        	getTotalRows: function getTotalRows() {
	            		return m.eg ? 0 : m.ghs.rhs.items.length;
        	},
        	
			getTotalColHeaderRows : function getTotalColHeaderRows(){
				return m.ghs.chs.items.length;
			},
        	
        	getTotalCols: function getTotalCols() {
        		return this.getColHeaders(0).size();
        	},
        	
        	getRowHeaders: function getRowHeaders(pos /*position*/) {
        		return new ns.Headers(m, pos, true);
        	},
        	
        	getColHeaders: function getColHeaders(pos /*position*/) {
        		return new ns.Headers(m, pos, false);
        	},
        	
        	getMetricValue: function getMetricValue(row, col) {
        		return new ns.MetricValue(m, m.gvs.items[row].items[col]);
        	},
			
			getColumnHeaderCount : function getColumnHeaderCount(){
				return m.gvs.items[0].items.length;
			},
			
			getCSSString : function getCSSString()
			{
				return m.cssString;
			}
			
						
    	};
    };
    
    mstrmojo.Vis.Titles = function (m, isRow) {
    	var t = (isRow) ? m.gts.row : m.gts.col;
    	return {
    		size: function size() {return t.length;},
    		getTitle: function getTitle(pos) {return new mstrmojo.Vis.Title(t[pos]);},
			getCSS : function getCSS(pos) {return m.css[t[pos].cni].n;}
    	};
    };
    
    mstrmojo.Vis.Headers = function (m /*Model*/, i /*position*/, isRow /*row or column*/) {
    	var t = (isRow) ? m.gts.row : m.gts.col;
    	var hs = (isRow) ? m.ghs.rhs : m.ghs.chs;
    	var h = hs.items[i].items;
    	
    	return {
    		size: function size() {return h.length;},
    		getHeader: function getHeader(pos) {
    			return h[pos] && new mstrmojo.Vis.Header(h[pos], isRow ? t[pos] : t[i]); 
    		},			
			getCSS : function getCSS(pos) {
				return m.css[h[pos].cni].n;
			},
			getHeaderCell : function(pos)
			{
				return h[pos];
			} 
			
    	};
    };

    mstrmojo.Vis.Title = function (t /*Title JSON */) {
    	return {
    		/**
    		 * Bitwise value that represents the the action type. 
    		 * Its possible values are:
    		 * - STATIC (0)
    		 * - DRILLING (0x1)
    		 * - SELECTOR_CONTROL (0x2)
    		 * - HYPERLINK (0x4)
    		 * - SORT (0x8)
    		 * - PIVOT (0x10)
    		 * - EDIT (0x20)
    		 */
    		getActionType: function() {return t.at;},
    		/**
    		 * An Object that represents the Drill Paths
    		 */
    		getDrillPath: function() {return t.dp;},
    		getHeaderValues: function getHeaderValues() {return t.es;},
    		getFormId: function() {return t.fid;},
    		getFormType: function() {return t.ftp;},
    		getUnitId: function() {return t.id;},
    		/**
    		 * A Map that represents the Links defined for Link Drilling 
    		 */
    		getLinkMap: function() {return t.lm;},
    		getName: function() {return t.n;},
    		getUnitDssType: function() {return t.otp;},		
			getSelectorControl : function() {return t.sc;}	
    	};
    };

    mstrmojo.Vis.Header = function (h /*Header JSON */, t /*Title JSON*/) {
    	return {
    		getName: function getName() {
    			return (h.idx === -1) ? "" :t.es[h.idx].n;
    		},
			getElementId : function getElementId(){
				return (h.idx === -1) ? "" : t.es[h.idx].id;
			},
			getElementIndex : function getElementIndex(){
				return h.idx;
			},
			getActionType : function getActionType(){
				return h.at;
			},
			isTotal : function isTotal(){
			   return h.otr === 1;	
			}
    	};
    };
    
    mstrmojo.Vis.MetricValue = function (m, jsonObj) {
    	var v = jsonObj;
    	return {
    		getValue: function getValue() {return v.v;},
			getThresholdType : function getThresholdType() { return v.ty;},
			getRawValue : function getRawValue() { return v.rv;},
			getCSS : function getCSS() { return m.css[v.cni].n},
			getThresholdValue : function getThresholdValue(defaultValue) 
			{
			    if (v.ti == undefined) {
					return defaultValue;
				}
				   
				return m.th[v.ti].n;
			}  
    	};
    };
})();