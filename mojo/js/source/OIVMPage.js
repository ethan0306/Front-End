(function(){

    mstrmojo.requiresCls("mstrmojo.Container",
        "mstrmojo._FillsBrowser",
        "mstrmojo._HasLayout");
    
    /**
     * The widget for the MicroStrategy Report Services "Optimized Interactive View Mode" page.
     * 
     * @class
     * @extends mstrmojo.Container
     * 
     * @borrows mstrmojo._HasLayout#height as #height
     * @borrows mstrmojo._HasLayout#width as #width
     * @borrows mstrmojo._HasLayout#layoutConfig as #layoutConfig
     * @borrows mstrmojo._HasLayout#onwidthChange as #onwidthChange
     * @borrows mstrmojo._HasLayout#onheightChange as #onheightChange
     * @borrows mstrmojo._HasLayout#setSlotDimension as #setSlotDimension
     */
    mstrmojo.OIVMPage = mstrmojo.declare(
        // superclass
        mstrmojo.Container,
        
        // mixins,
        [mstrmojo._FillsBrowser, mstrmojo._HasLayout],
        
        /**
         * @lends mstrmojo.DocLayout.prototype
         */
        {
            scriptClass: "mstrmojo.OIVMPage",
            
            markupString: '<div id="{@id}" class="mstrmojo-OIVMPage {@cssClass}" style="{@cssText}">' +
                              '<div class="mstrmojo-OIVMPage-toolbar"></div>' +
                              '<div class="mstrmojo-OIVMPage-layout"></div>' +
                          '</div>',
                          
            markupSlots: {
                toolbar: function(){ return this.domNode.firstChild; },
                layout: function(){ return this.domNode.lastChild; }
            },
            /**
             * Handler for page error in OIVM page.
             * For report expired or cache not found error, it will put 'Re-Run Document' button in.
             */
            onError: function(err) {
        		d = err.detail,
        		app = mstrApp,
        		btnHalo = '#666',   // Button halo color.
        		c = err.code;
        		if (c) {
        			var nib = mstrmojo.Button.newInteractiveButton;
        			switch (c) {
        			case -2147468986:	// ERR_API_REPORT_EXPIRED
        			case -2147467618:   // ERR_API_CACHE_NOT_FOUND
		        		err.btns = [
		        		            nib(mstrmojo.desc(3758, 'Re-run Document'), function() {
						        		    mstrmojo.form.send({
						        		        evt: 2048001,            // executeRWDocumentLight
						        		        src: app.name + "." + app.pageName + ".2048001",
						        		        documentID: d.dssid,
						        		        currentViewMedia: 1
						        		    });
						
						        		}, btnHalo),
						        	nib(mstrmojo.desc(221, 'Cancel'), null, btnHalo)
					        		];
		        		break;
		        	default:
		        		err.btns = [
		        		            nib(mstrmojo.desc(212, 'Continue'), function() {
					        		    mstrmojo.form.send({
					        		        evt: 3026,
					        		        src: app.name + "." + app.pageName + ".3026"
					        		    });
					        		}, btnHalo)
				        		];
        			}
        		}
            },
            // ----------- This is general to all pages, if we have a page widget, we should move these logics there ----------//
            /**
             * Renders page loading error.
             */
            renderPageLoadError: function() {
            	var err = this.error;
            	// indivual page has a chance to update error object before being used to display;
            	this.onError(err);
            	
            	if (!err.btns || !err.btns.length) {
            		mstrmojo.alert(err.message, null, err.title);
            	} else {
            		mstrmojo.confirm(err.message, err.btns, err.title);
            	}
            },
            /**
             * Override render method to handle page loading error.
             */
            render: function() {
            	if (this.error) {
            		this.renderPageLoadError();
            	} else {
            		this._super();
            	}
            },
            // -----------------------------------------------------------------------------------------------------------------//
            layoutConfig: {
                h: {
                    toolbar: '30px',
                    layout: '100%'
                },
                w: {
                    layout: '100%'
                }
            }
        }
    );
    
})();