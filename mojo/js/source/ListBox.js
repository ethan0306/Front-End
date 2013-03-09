(function(){

	mstrmojo.requiresCls("mstrmojo.ListBoxBase", "mstrmojo._HasScrollbox");
	
	mstrmojo.ListBox = mstrmojo.declare(
		// superclass
		mstrmojo.ListBoxBase,
		
		// mixins
		[mstrmojo._HasScrollbox],
		
        // instance members 
		{
			scriptClass: "mstrmojo.ListBox",

			/** 
			 * Safety override: if this widget's "renderAllItems" property is explicitly set to true,
			 * all items are rendered immediately, not on-demand. By default, the property is false.
			 */
			renderAllItems: false,
			
            /**
             * Pause (millisec) between rendering sets of pages.
             */
            renderPause:10,

			/**
			 * Count (1-based) of pages rendered so far. Rendered pages that are not yet filled are still counted.
			 */
			numPagesRendered: 0,

			/**
			 * Array of objects, keyed by page index, for each rendered page: {filled (Boolean), height (Integer)}
			 */
			pageStatus: null,			

			/**
			 * Calculations and estimates derived for use with incremental rendering.
			 */
			_rc: null,
			_totalPages: null,
			_rh: null,
			_rhMin: 8,
			_rowsPerPage: null,
			_defaultRowsPerPage: 100,
			_minRowsPerPage: 100,
			_pageHeight: null,
			
			/**
			 * Extends the rendering by calculating a # of rows per page, then limiting the rendering to only the
			 * first "page" of rows, marking the first page as rendered, and then if needed connecting to a scrollbox.
			 */
			buildRendering: function bldRnd() {
				// Check override; if activated, revert to standard (not incremental) rendering.
				if (this.renderAllItems === true) {
					this._super();
					return true;
				}
				
				// Make calculations about page sizes.
				this._initPageSettings();
				
				// Minor hack: fool the inherited superclass method into rendering only the first page of 
				// items by temporarily settings this.items to a subset.
				var tmp = this.items;
				this.items = this._rc ?
								this.items.slice(0, Math.min(this._rowsPerPage, this._rc)) : 
								[];

				// The inherited method sets the "itemsHtml" property and renders the markup.
				this._super();
				
				// Undo our hack above: reset this.items.
				this.items = tmp;

				// Update the status of the first page as rendered and filled.
				this.postRenderPage(0, true);

				// Are there more pages to render (on-demand)?
				if (this._rc > this._rowsPerPage) {
					// One-time set up for on-demand rendering;
					// Preserve white space for unrendered rows. This yields a more accurate scrollbar.
					this.itemsContainerNode.style[mstrmojo.css.MINHEIGHT] = (this._rh * this._rc) + 'px';
					// Connect scrollbar to listen for scrolling (if we haven't already, from previous renderings).
					if (!this.connectedScrollbox) {
						this.connectScrollbox(this);
						this.connectedScrollbox = true;
					}
				} else {
					// Cleanup after all pages have been rendered.
					this.postRenderingCleanup();
				}
				
			},

			/**
			 * Calculates how many rows should be in rows go in one page.
			 * Assumes we've already measured the scrollbox height.
			 */
			_initPageSettings: function initPgSet() {
				// Cache row count.
				var its = this.items;
				this._rc = (its && its.length) || 0;
				
				// Use the row height defined by itemRenderer if any; otherwise, use estimated minimum.
				var ir = this.itemRenderer;
				this._rh =  (ir && ir.rowHeight) || this._rhMin || 3;
				// Compute row count and height of pages.
				var rpp = this._defaultRowsPerPage;
                // Does our scrollbox have a fixed height ?  
                if (!isNaN(this.scrollboxHeight)) {
                    // How many rows fit within that height?
                    rpp = Math.ceil(this.scrollboxHeight/this._rh);
                    // Enforce the min rows per page setting, 
                    rpp = Math.max(rpp, this._minRowsPerPage);
                }
            	this._rowsPerPage = rpp;
				this._totalPages = Math.ceil(this._rc/this._rowsPerPage);	
				this._pageHeight = this._rh * this._rowsPerPage;
				this._pageStatus = new Array(this._totalPages);
				this._numPagesRendered = 0;
			},

            /**
             * Scrollbox Listener. Gets wired up after rendering first page, if any other pages still pending.
             * Triggers the rendering routine if its not active already. 
             */
            onscroll: function onscroll() {
                // if we are rendering currently, don't do anything. The page rendering thread will take care of ensuring that the most recent viewport (scrollbox) is filled up. 
                if (!this._renderingRows) {
                    this._startPageRenderThread();
                }
            },

            /**
             * Routine to render a block of pages requested through scrolling (or filling up viewport empty space after rendering the first page).   
             */
            _startPageRenderThread: function startRndrThd() {
            
                this.renderingRows = true;
                var me = this;
                this._renderTimer = self.setInterval(
                                        function(){
                                            // Do we have any pages to render and/or fill that
                                            // have not been rendered/filled yet?
                                            var pages = me.getPagesToRender();
                                            
                                            if(pages.length > 0) {
                                            	// Render the pages and do the post-process for each.
                                                me.renderPages(pages);
                                            } else {
                                                // No pages to render. Stop timer. 
                                                me.renderingRows = false;
                                                self.clearInterval(me._renderTimer);
                                                delete me._renderTimer;
                                                
	                                            if(me.isRenderingComplete()) {
													me.postRenderingCleanup();
												}
                                                me = null;
                                            } 
                                        },
                                        this.renderPause
                                    );
            },

            /**
             * Returns the indices of the pages to be rendered and/or filled.
             */
            getPagesToRender: function getPagesToRender() {
                var pages = [],
	                pageSize  = this._pageHeight,
	                tBodies = null,
	                stats = this._pageStatus,
	                me = this;
	                
                // util function for obtaining the height of a page.
                function pageHeight(idx) {
                	// is the page filled?
                	var stat = stats[idx];
                	if (stat && stat.filled) {
                		// page is filled: use cached page measurement (if cache missing, measure now & cache)
                		if (!stat.height) {
                			if (!tBodies) tBodies = me.itemsNode.tBodies;
                			stat.height = tBodies[idx].offsetHeight;
            			}
                		return stat.height;
                	} else {
                		// page is not filled: use the default page height
                		return pageSize;
                	}
                }

                // get indices of the top and bottom page adjacent to the scrolled region.
                // first, for the top, walk the page heights until you reach the scrollboxTop.
                var y = 0,
                	topPageIdx = null,
                	bottomPageIdx = null,
                	scrollTop = this.scrollboxTop;
                for (var i=0, len=this._totalPages; i<len; i++) {
                	y += pageHeight(i);
                	if (y >= scrollTop) {
                		topPageIdx = i;
                		break;
                	}
                }
                // did we find a top page? 
                if (topPageIdx == null) {
					// no, assume its the last page
                	topPageIdx = bottomPageIdx = len-1;
                } else {
	            	// yes, so now find the bottom page index by continuing walk of page heights
	            	var scrollBottom = this.scrollboxBottom;
	            	for (var j=topPageIdx+1; j<len; j++) {
	            		if (y >= scrollBottom) {
	            			bottomPageIdx = j-1;
	            			break;
	            		}
	            		y += pageHeight(j);
	            	}
            	}
            	// if we didn't find a bottom page, assume it was the last page
            	if (bottomPageIdx == null) {
            		bottomPageIdx = len-1;
            	}
				
				// add to our list any pages which are above the viewport and have not been rendered at all;
				// these do not need to have their cells filled.
				for(var n=this._numPagesRendered;n<topPageIdx;++n) {
					pages.push({idx: n, fill: false});
				}                	
				
				// add to our list any pages which are WITHIN the viewport and have not had their cells filled.
				// these need to have their cells filled.
				for (var m=topPageIdx;m<=bottomPageIdx;++m) {
					var stat = stats[m];
					if (!stat || !stat.filled) {
						pages.push({idx: m, fill: true});
					}
				}

                return pages;
            },            

            /**
             * Renders (and if desired, fills) the pages at the given indices.
             */
            renderPages: function renderPages(/* Array[Object] */ pages) {
                for(var i = 0, len = pages.length; i < len; ++i) {
                    this.renderPage(pages[i].idx, pages[i].fill);
                }
            },

            /**
             * Renders (and if desired, fills) a page at the given index. 
             */
            renderPage: function renderPage(/* int */ idx, /*Boolean*/ bFillCells) {
            	// Has the requested page already been rendered?
            	var arrStatus = this._pageStatus,
            		alreadyRendered = (this._numPagesRendered >= idx+1);
        		if (alreadyRendered) {
        			// Yes it has been rendered. If we're not asked to fill its cells, or if it's cells are already filled,
        			// then we don't need to do anything, so exit.
        			if (!bFillCells || (arrStatus[idx] && arrStatus[idx].filled)) return;
    			}

                // calc the start, end indexes. 
                var rpp = this._rowsPerPage,
					start = idx * rpp,
                	end = Math.min(start + rpp, this._rc) - 1; 
                
                // in this mode, we will render each page as a tbody and after rendering, we will move the tbody to the actual Grid table. 
                // create the tbody inside a temp div, which is cached for re-use with subsequent pages.
                var tempTableCont = this.tempTableCont;
                if (!tempTableCont) {
                	tempTableCont = this.tempTableCont = this.domNode.ownerDocument.createElement('div');
            	}
                var tInnerHTML = bFillCells ?
                					// To fill the cells, use our inherited method for building markup.
									// Dont bother with the full markupPrefix and markupSuffix below. We just need a temp table
									// to hold the tbody, which will then be moved into the actual fully rendered table.
                					this._buildItemsMarkup(
										start, 
										end, 
										'<table><tbody idx="' + idx + '">',
										'</tbody></table>',
										this._itemPrefix && this._itemPrefix(),
										this._itemSuffix && this._itemSuffix()).join('') 
									:
									// If not filling cells, render a single-cell tbody placeholder. Hopefully a fast operation.
                					'<table><tbody idx="' + idx + '"><tr><td style="height:' + this._pageHeight + 'px">&nbsp;</td></tr></tbody></table>';
                tempTableCont.innerHTML = tInnerHTML; 
                
                // get the first tbody from our temp table. 
                var tbody = tempTableCont.firstChild.tBodies[0],
                	tn = this.itemsNode;
                
                // move the tbody we just built to the actualy Grid Table. 
                // if the page has not been rendered yet, simply append.
                if (!alreadyRendered) {
	                tn.appendChild(tbody);
                } else {
                	// otherwise, it has been rendered, so we need to swap the old tbody for the new tbody
                	tn.replaceChild(tbody, tn.tBodies[idx]);
                }
                                
                // post processing extension. 
                this.postRenderPage(idx, bFillCells);
            },

			postRenderPage: function pstRndPg(/*Integer*/ idx, /*Boolean*/ bFillCells) {
                // mark the current page as rendered. 
                if (idx+1 > this._numPagesRendered) this._numPagesRendered = idx+1;
                // update the page's status: did we fill the cells? if so, what is the actual height of the page?
                var arr = this._pageStatus,
                	status = arr[idx];
                if (!status) {
                	// the page has rendered (but possibly not filled), so add a record for it
                	status = arr[idx] = {};
                }
                if (bFillCells) {
                	// update the filled record for the page; if it was previously filled, dont ever reset back to un-filled.
                	status.filled = true;
                }

	            // if we just rendered the last page (either filled or not), then we don't
	            // need the estimate height on the table container.  this estimate height was
	            // set only if there are multiple pages.  if it was set, remove it.
                if (idx >0 && idx == this._totalPages-1) {
					this.itemsContainerNode.style[mstrmojo.css.MINHEIGHT] = '';
				}
			},

	        /**
             * Checks whether all pages have been rendered. 
             */
            isRenderingComplete: function isRdrComplete() {
                // first make sure we've rendered all pages
                if (this._numPagesRendered == this._totalPages) {
                	// all pages are rendered, now make sure all pages have their cells filled in.
                	// this assumes that the length of the array _pagesFilled was initialized to the # of pages.
                	for (var arr=this._pageStatus, i = this._totalPages-1; i >-1; i--) {
                		if (!arr[i] || !arr[i].filled) return false;
                	}
                	return true;
                }
                return false;
            },

            /**
             * Post Rendering Cleanup after all pages have been rendered & filled. 
             */
            postRenderingCleanup: function pstRndClnup() {
            	// detach scroll event listener
                if (this.connectedScrollbox) {
                	this.disconnectScrollbox(this);
                	this.connectedScrollbox = false;
            	}
            },
            
            unrender: function(ignoreDom){
            	this.postRenderingCleanup();
            	this._super(ignoreDom);
            },
            
            refresh: function refresh() {
            	if (!this.hasRendered) return;

            	var d = this.domNode,
            		p = d && d.parentNode;
            	// If we don't have a parent widget, and we're embedded in a parent DOM node,
            	// we need a temp placeholder to indicate where our re-render will occur.
            	if (!this.parent && p) {
            		var elTemp = d.ownerDocument.createElement('span');
            		p.insertBefore(elTemp, d);
            	}

            	this.unrender();
            	
            	// If we have a temp placeholder, store it this.domNode so our render call
            	// will swap it out with the newly rendered DOM.
            	if (!this.parent && p) {
            		this.domNode = elTemp;
            	}

            	this.render();

                           
            	// Reset the readyState of our definition.
            	if (this.defn && this.defn.set) {
            		this.defn.set('readyState', mstrmojo.EnumReadystate.IDLE);
            	}
            }


		}
	);
})();			
