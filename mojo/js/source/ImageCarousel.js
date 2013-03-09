(function(){
    
    mstrmojo.requiresCls("mstrmojo.Vis", 
                         "mstrmojo._TouchGestures", 
                         "mstrmojo.HBox",
                         "mstrmojo.Label",
                         "mstrmojo.Image",
                         "mstrmojo._HasTouchScroller");
    
    var $M = Math,
        $CSS = mstrmojo.css,
        $DOM = mstrmojo.dom,
        BORDER_WIDTH = 30,
        MARGIN_BOTTOM = 50,
        DOT_INTERVAL = 32;
    
    /**
     * Gets the container width or height.
     * @param {String} dimension. Value can be 'Height' or 'Width'.
     * @returns {Integer} The height or width of container.
     */
    function getDimension(dimension) {
        //Do we already have the value cached?
        var n = 'container' + dimension;
        if(!this[n]) {
            var domNode = this.domNode,
            x = parseInt(this[dimension.toLowerCase()], 10);
            
            //Cache the value
            this[n] = (isNaN(x)) ? domNode['client' + dimension] : x;
        }
        return this[n];
    }    
    
    /**
     * Gets the colgroup HTML markup string for table. Each column width is set to the same width.
     * @param {Integer} len The number of columns.
     * @returns {String} The colgroup HTML markup string. 
     */
    function getColGroupHTML(len) {
        var i, cols = '';
        if(len > 0) {
            for(i = 0; i < len; i++) {
                //Use percentage to control the width of each column.
                cols += '<col style="width:' + $M.round(100/len) + '%" />';
            }
        }
        return '<colgroup>' + cols + '</colgroup>';
    }
        
    /**
     * Returns the absolute path for a given image path. If the image path is absolute URL (containing 'http' in the path), no changes on the URL.
     * Otherwise we concat the image server with the image path.  
     * @param {String} n The image path. 
     * @returns {String} The absolute image URL.
     */
    function getImagePath(n) {
        if(/http:/i.test(n)) {
            return n;
        } else {
            var webSrv = mstrApp.getConfiguration().getHostUrlByProject(mstrApp.getCurrentProjectId());
            return  webSrv.replace(/(servlet\/|asp\/)$/i, '') + n;
        }
    }
    
    /**
     * Uses the Webkit's transform property to translate a DOM node to a position on the X-axis. The animation duration is set to 500ms.
     * @param {HTMLElement} domNode The given DOM node for translate.
     * @param {Integer} xpos The end position on X-axis.    
     */
    function transitTo(domNode, xpos) {
        domNode.style.webkitTransitionDuration = '500ms';
        $DOM.translate(domNode, xpos, 0, 0, '', true);
    }
    
    /**
     * Resize a give image to fit to its container.
     * @param {HTMLElement} n The image DOM node
     * @param Integer w The width of the container
     * @param Integer h The height of the container
     * @returns {Boolean} True if the image is resized, otherwise false.
     */
    function resizeImage(n, w, h) {
        var iw = n.clientWidth, //image width
            ih = n.clientHeight, //image height
            rw, rh,
            resized = false;
        
        //if any dimension is bigger than the container, we need to resize the image
        if(w < iw || h < ih) {
            resized = true;
            rw = w/iw; //ratio of width to compress
            rh = h/ih; //ratio of height to compress

            //if width needs to compress more
            if(rw < rh) {
                //set the image width using the container width
                n.width = w;
            } else {
                //otherwise, use the container height as the image height
                n.height = h;
            }
        }
        return resized;
    }
    
    /**
     * Returns the headers organized by column.
     * @param {Object} dp The data parser object.
     * @returns {Object} An array of object arrays. Each object array contains the data of
     */
    function getHeadersByColumn(dp) {
        var cols = [], r, c, col,
            rhs, hds,
            rc = dp.getTotalRows(), //row count
            cc = rc > 0 ? dp.getRowTitles().size() : 0; //column count
        //go through each row
        for(r = 0; r < rc; r++) {
            //get all the row headers
            rhs = dp.getRowHeaders(r);
            //for each columns of the row
            for(c = 0; c < cc; c++) {
                //create a new array if no array previously created to store the values
                if(!cols[c]) {
                    cols[c] = [];
                }
                //get the header for the column
                hds = rhs.getHeader(c);
                //save the value into an object and push the object into the object array
                cols[c].push({n: hds.getName()});
            }      
        }
        return cols;
    }
    
    /**
     * <p>This component is used to visualize the images stored in grid.</p>
     * 
     * @class
     * @extends mstrmojo.Vis
     */    
    mstrmojo.ImageCarousel = mstrmojo.declare(
        //baseclass
        mstrmojo.Vis,
        //mixins
        [mstrmojo._TouchGestures, mstrmojo._HasTouchScroller],
        /**
         * @lends mstrmojo.ImageViewer.prototype
         */        
        {
            scriptClass: 'mstrmojo.ImageCarousel',
            
            markupString: '<div class="mstrmojo-ImageCarousel {@cssClass}" style="overflow:hidden;{@cssText}">'+
                              '<div class="imageViewer" mstrAttach:click>{@noImageMsg}</div>' +
                              '<div class="imageTitle"></div>' +
                              '<div class="statusBar" style="overflow:hidden"></div>' +
                          '</div>',            
        
            markupSlots: {
                viewerNode: function() { return this.domNode.firstChild; },
                textNode: function() { return this.domNode.childNodes[1]; },
                statusBarNode: function() { return this.domNode.lastChild; }
            },
                          
            formatHandlers: {
                domNode: [ 'RW' ]
            },
            
            /**
             * Scroller configuration for the image viewer
             */
            scrollerConfig: {
                friction: 0.0087,
                bounces: true,
                vScroll: false,
                hScroll: true
            },            
                        
            /**
             * The index of selected image
             */
            selected: -1,
            
            /**
             * First child: The image list. All the images are placed inside the table cells of mstrmojo.HBox.
             * Second child: The description text. The description of the image.
             * Third child: The status bar.  The status bar use white and gray dots indicating which image is selected.
             */
            children: [{
                scriptClass: 'mstrmojo.HBox',
                slot: 'viewerNode',
                alias: 'viewer',                
                onitemsChange: function() {
                    var v, i, len, c = [];
                    v = this.items;
                    if(!this.hasRendered) {
                        var p = this.parent,
                            cw = getDimension.call(p, 'Width'), //container width
                            ch = getDimension.call(p, 'Height'); //container height

                        if(this.children) {
                            this.removeChildren();
                        }                        
                        
                        len = v.length;
                        //set each column to be the same width
                        this.colHTML = getColGroupHTML(len);
                        //set the table width to be the total width of all columns and set the height to be 
                        //the photo viewers area height
                        this.cssText = 'width:' + (cw*len) + 'px;height:' + (ch - MARGIN_BOTTOM) + 'px';
                        for(i = 0; i < len; i++) {
                            c.push({
                                scriptClass: 'mstrmojo.Image',
                                src: getImagePath(v[i].n || v[i].v),
                                onload: function() {
                                    //once image is loaded, we might need to resize it
                                    resizeImage(this.imgNode, cw - BORDER_WIDTH, ch - MARGIN_BOTTOM);
                                }
                            });
                        }
                        this.addChildren(c);
                    }
                }
            },{
                scriptClass: 'mstrmojo.Label',
                slot: 'textNode',
                alias: 'description'
            }, {
                scriptClass: 'mstrmojo.HBox',
                slot: 'statusBarNode',
                alias: 'sb',
                onitemsChange: function() {                
                    var v = this.items, c = [], i, len;
                    
                    //if items are changed, we should remove the existing children and reset all the variables
                    if(this.children) {
                        this.removeChildren();
                        delete this.numVisibleDots;
                        this.lastSelected = -1;
                    }
                    
                    for(i = 0, len = v.length; i < len; i++) {
                        c.push({
                            scriptClass: 'mstrmojo.Label'                            
                        });
                    }
                    this.addChildren(c);
                    
                    //once items are reset
                },
                lastSelected: 0, //record the last selected index 
                select: function(idx) {
                    var lstPg, curPg, dn = this.domNode, dts = this.numVisibleDots; 
                    
                    if(this.selectedNode) {
                        $CSS.removeClass(this.selectedNode.domNode, 'selected');
                    }
                    
                    //if we have items to select
                    if(this.items.length > 0) {
                        this.selectedNode = this.children[idx];
                        $CSS.addClass(this.selectedNode.domNode, 'selected');
                        
                        //if the selected idx exceeded the maximum visible one, shift the status bar to left to displaying the remaining ones
                        //or if the selected idx needs go back to previous visible dots, the status bar needs to be shifted back
                        if(!dts) {
                            dts = this.numVisibleDots = $M.floor(getDimension.call(this.parent, 'Width')/DOT_INTERVAL);
                            if(this.items.length < dts) {
                                $CSS.addClass(dn, 'center');
                            } else {
                                $CSS.removeClass(dn, 'center');
                            }
                        }
                        
                        lstPg = $M.floor(this.lastSelected/this.numVisibleDots);
                        curPg = $M.floor(idx/this.numVisibleDots);
                        //if needs to change page position of the status bar
                        if(lstPg !== curPg) {
                            transitTo(dn, -curPg * dts * DOT_INTERVAL);
                        } 
                        this.lastSelected = idx;
                    }
                }
            }],
            
            //configure the horizontal scroller
            updateScrollerConfig: function updateScrollerConfig() {
                var len = this.viewer.items.length;
                mstrmojo.hash.copy({
                    scrollEl: this.viewerNode,
                    origin: {x: 0, y: 0},
                    offset: {
                        x: {
                            start: 0,
                            end: ((len > 0) ? (len - 1) : 0) * getDimension.call(this, 'Width')
                        }    
                    }
                }, this.scrollerConfig);
                return this._super();
            },
            
            initScroller: function initScroller(scroller) {
                // Attach an event listener to hear when scrolls are done.
                scroller.attachEventListener('scrollDone', this.id, function (evt) {
                    var translateX = evt.x,
                        width = getDimension.call(this, 'Width'),
                        selectedIdx = $M.floor(translateX / width),
                        position = $M.floor( selectedIdx * width),
                        extraPos = $M.abs(translateX - position);
                    
                        //unset the selected value so that we will force the scroller to scroll
                        this.selected = -1;
                    
                        if(extraPos >= width * 0.5) {
                            selectedIdx += 1;
                        }
                        this.set('selected', selectedIdx);
                });
            },            
            
            onclick: function(e) {
                var dlgCfg;
                //go to full screen mode
                if(mstrApp.getScreenDimensions && this.selectedImage) {
                    dlgCfg = {
                            cssClass: 'image-FullScreen',
                            onclick: function() { this.close(); },
                            //get dimension data once the widget is created
                            postCreate: function() {
                                this.dim = mstrApp.getScreenDimensions();
                            },
                            //reset the dialog dimension if dialog is resized (e.g. rotate screen from portrait mode to landscape mode)
                            resizeDialog: function() {
                                var d = this.dim,
                                    dm = this.domNode,
                                    ds = dm && dm.style;
                                if(d && ds) {
                                    ds.width = d.w + 'px';
                                    ds.height = d.h + 'px';
                                }
                            },
                            //put a mstrmojo.Image object as the content
                            children:[{
                                scriptClass: 'mstrmojo.Image',
                                src: this.selectedImage,
                                onload: function() {
                                    var d = this.parent.dim;
                                    if(d) {
                                        //if the image width and height is adjusted, that means the original position of 
                                        //dialog might not be right. We need to re-position dialog
                                        if(resizeImage(this.imgNode, d.w, d.h)) {
                                            this.parent.positionDialog();
                                        }
                                    }
                                }
                            }]};
                    mstrApp.showDialog(dlgCfg);
                }
            },
            
            touchTap: function(e) {
                this.onclick(e);
            },
            
            preBuildRendering: function preBuildRendering() {
                var dp = this.getDataParser(),
                    headers = getHeadersByColumn(dp),
                    imgs, desc;
                imgs = headers[0] || []; //first column, path
                desc = headers[1] || []; //second column, description
                this.viewer.set('items', imgs);
                this.sb.set('items', desc);
                this.selected = -1;
                
                //if more than one image, we need to hide the noImageMsg 
                if(imgs.length > 0) {
                    this.cssClass = this.cssClass ? '' : this.cssClass.replace(/noImage/, '');
                    this.noImageMsg = '';
                } else {
                    this.cssClass += this.cssClass ? '' : ' noImage';
                    this.noImageMsg = 'No Photo Found';
                }
                
                this._super();
            },
            
            postBuildRendering: function postBuildRendering() {
                this._super();
                
                //select the first image as selected one
                this.set('selected', 0);
            },
            
            /**
             * Set the status bar and the description of the image.
             * @param {Integer} idx
             */
            onselectedChange: function onselectedChange() {
                var idx = this.selected, 
                    s = this.sb,
                    img = this.viewer.items[idx],
                    desc = s.items[idx];
                
                //if there is an image selected
                if(img) {
                    //set the scroller to scroll to a proper position
                    this._scroller.scrollTo(idx * getDimension.call(this, 'Width'), 0, 500);
                    //save the image URL
                    this.selectedImage = getImagePath( (img && img.n) || '');
                    
                    //change the dot indicator 
                    s.select(idx);
                    
                    //set the description
                    this.description.set('text', (desc && desc.n) || '');
                }
            }
            
            
        });
}());