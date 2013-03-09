/**
 * Model for MSTR Element collection.
 * 
 * This is a fetchable collection, which implements _Fetchable. 
 * 
 * So, once user get hold of this collection, it can browse forward/backward or jump.
 */
(function() {
    mstrmojo.requiresCls("mstrmojo._Fetchable",
                         "mstrmojo.hash");

    var $H = mstrmojo.hash;
    
    function getDS() {
    	return mstrApp.viewFactory.newElementDataService();
    }

    function getElementArity(elementID) {
        var count1, count2, startPos;

        count1 = -1;
        startPos = 0;
        while (startPos >= 0) {
            count1++;
            startPos = elementID.indexOf(":", startPos);
            if (startPos >= 0) 	startPos++;
        }

        count2 = -1;
        startPos = 0;
        while (startPos >= 0) {
            count2++;
            startPos = elementID.indexOf("*:", startPos);
            if (startPos >= 0) startPos++;
        }

        if (count1 < count2 + 1) {
            alert ("Unexpected format for element ID " + elementID);
        }

        return count1 - count2;
    }

	mstrmojo.requiresCls("mstrmojo.XMLBuilder", "mstrmojo.Obj");
	mstrmojo.mstr.WebElements = mstrmojo.declare(
			// super class
			mstrmojo.Obj,
			// mixin
			[mstrmojo._Fetchable],
			// properties
			{
				/**
				 * The source for this collection. Most time it is an attribute.
				 */
				source: null,
				/*
				 * Array of items.
				 * Currently we do not have a class for WebElement, we use JSON object passed from 
				 * web server side to represent it for now. It contains these properties:
				 * - n : name
				 * - v: element id
				 * - t: element type 
				 */
				items: null,
				duplicate: function() {
					return new mstrmojo.mstr.WebElements({
							source: $H.copy(this.source),
							browseConfig: $H.copy(this.browseConfig)
					});
				},
				//==================== browsing related logic ===================
				/**
				 * The config settings relate to element browsing.
				 * 
				 * It includes these properties:
				 * - blockBegin
				 * - blockCount
				 * - filter
				 * - dataSources
				 * - searchPattern
				 * - searchForm
				 * - matchCase
				 */
				browseConfig: null,				
				init: function(props) {
					var cf = props && props.browseConfig
					if (cf) {
						this.blockBegin = cf.blockBegin || 1;
						this.blockCount = cf.blockCount || 15;
					}
					if (this._super) {
						this._super(props);
					}
				},
				getBrowseConfig: function(bb){
					var config = this.browseConfig;
					return {
		                'attributeID': this.source && this.source.did || 0,
		                'blockBegin': bb || 1,
		                'blockCount': this.blockCount || -1,
		                'filterXML': config.filter && config.filter.getXML() || '',
		                'shortFilterXML' : config.shortFilterXML || '',
		                'searchPattern': config.searchPattern || '',
		                'matchCase' : !!config.matchCase,
		                'dataSourcesXML': config.dataSources || '',
		                'targetAttributeID':config.searchTarget && config.searchTarget.did || '',
		                'searchForms':config.searchForms || ''
//		                'includeFormNames': !!collectForms,
//		                'includeFormValues' : !!bIncludeFormValues,
//		                'displayedForms' : displayedForms || mstr.Enum.Widget.DISPLAYEDFORMS.BROWSE,
//		                'dimensionID' : dimensionId || ''
					}
				},
				_retrieveItems: function(bb, callbacks){
				    var me = this;
					getDS().getElements(
							this.getBrowseConfig(bb)
							, 
							{
		                        success: function (res) {
		                            if (callbacks && callbacks.success) {
		                            	callbacks.success({
		                            		items: me.convertElems(res.items),
		                            		totalSize: res.totalSize
		                            	});
		                            }
		                        },
		                        failure: function (details) {
		                        	if (callbacks && callbacks.failure) {
		                        		callbacks.failure(details);
		                        	}
		                        }
		                    });

				},				
			    /**
			     * Convert items from ListModel.items format to Element format. 
			     * The items comes from task call would be of an array of ItemInfo. 
			     * But WebElements currently expectes an array of Element type. 
			     * So, we have to perform conversion here. 
			     */
				convertElems: function convertElems(items){
			        var ris = [],
			            items = items || [];
			        for (var i = 0; i < items.length; i ++) {
			            var item = items[i];
			            ris[i] = {
			                    vi: i,
			                    v: item.dssid,
			                    n: item.n,
			                    t: item.emt
			            }
			        }
			        return ris;
			    },

				//==================== end of browsing ============================
				//==================== xml related logic ==========================
				/**
				 * Build short XML for this collection.
				 */
				buildShortXML: function buildShortAnswerXML(builder) {
					builder.addChild("mi");
			        builder.addChild("es");
			        if (this.source != null) {
			            this.source.buildShortObjectElt(builder);
			        }
			        //TQMS 487203. Sort elements by name to make sure that we hit the cache
			        //regardless of the sequence in which elements were selected. 
			        var es = [].concat(this.items);
			        es.sort(function(e1, e2) {
			        	var n1 = e1.n,
			        	    n2 = e2.n,
			        	    res;
			        	if ( n1 === n2 ) {
			        		res = 0;
			        	} else if ( n1 < n2 ) {
			        		res = -1;
			        	} else {
			        		res = 1;
			        	}
			        	return res;
			        });
			        for (var i = 0; i < es.length; i++) {
			            var elt = es[i];
			            builder.addChild("e");
			            builder.addAttribute("ei", elt.v);
			            builder.addAttribute("emt", elt.t);
			            builder.addAttribute("art", getElementArity(elt.v));
			            builder.addAttribute("disp_n", elt.n);
			            builder.closeElement(); // e
			        }
			        builder.closeElement(); // es 
			        builder.closeElement(); // mi
				}
				//===================== end of xml ==================================
			}
	);
})();