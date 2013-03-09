(function(){

    mstrmojo.requiresCls("mstrmojo.ListBox");
    
    
    /**
     * <p>MultiColumnListBox renders data items in a multi-column table layout.</p>
     * 
     * <p>It contains Header and Data sections, each is a &lt;TABLE&gt;; And Data &lt;TABLE&gt; supports column sorting, resizing and inline editing. </p> 
     * 
     * @class
     * @public 
     * @extends mstrmojo.ListBox
     */
    mstrmojo.MultiColumnListBox = mstrmojo.declare(
        // superclass
        mstrmojo.ListBox,
        
        // mixins
        null,
        
        /**
         * <p>Instance members</p>
         * 
         * @lends mstrmojo.MultiColumnListBox.prototype
         */
        {
            /**
             * @ignore
             */
            scriptClass: "mstrmojo.MultiColumnListBox",
            
            /**
             * <p>Override</p>
             */
            cssClass: '',
            
            /**
             * <p>Override</p>
             */
            tableCssClass: "mstrmojo-MultiColumnListBox-table",
            cellCssClass: '',
            
            /**
             * <p>User provided inline styles applied in widget level</p>
             * 
             * @type String
             */
            cssText: '',

            /**
             * <p>Widget width</p>
             * @type String
             * @default '200px'
             */
            width: '200px',
            
            /**
             * <p>Widget height</p>
             * @type String
             * @default '200px'
             */
            height: '200px',
            
            /**
             * <p> 'width' property in each column item definition will be ignored, even if it is specified with value</p>
             * @type Boolean   
             * @default true
             */
            autoColWidth: true,
            
            /**
             * <p>Minimum column width<p>
             *
             *@constant
             *@type Integer 
             *@default 10px
             */
            minColWidth: 10,
            
            /**
             * <p>HEADER and DATA &lt;TABLE&gt; widths.</p>
             * 
             * <p>Value is width in pixels when sizeMode is 'fixed' or '100%'</p>
             * 
             * @type String
             * @default '100%'
             */
            tableWidth : '100%',
            
            /**
             * <p>Number of columns in the grid</p>
             * 
             * <p>The value will be updated by Content Provider during preBuildRendering stage when the data is sent down from server. </p>
             *  
             * @type Integer
             */
            colCount: 0,
            
            /**
             * <p>Array of &lt;COLGROUP&gt; DOMNodes in both HEADER AND BODY &lt;TABLE&gt;s</p>
             * 
             * <p>This array should have only two elements, one for each of the two &lt;TABLE&gt;s; 
             * and each element is an object reference to the corresponding &lt;COLGROUP&gt; DOMNode.</p>
             * 
             * @type Array
             */
            colGroups: null,
            
            /**
             * <p>Array of columns width. Each item will be applied to &lt;COL&gt; with the same index.</p>
             * @type Array
             */
            colWidths: null,
            
            /**
             * <p>The index of the column to sort upon</p>
             * 
             * @type Integer
             */
            sortIndex: null,
            
            /**
             * <p>Indicating sorting order.</p> 
             * 
             * <li>true - ascending (default)</li>
             * <li>false - descending</li>
             * 
             * @type Boolean
             * @default true
             */
            sortDirection: true,

            /**
             * <p>Default icon for Widget titlebar</p>
             * 
             * <p>The icon will be displayed very left of titlebar. This property value should be a string used as CSS Class </p>
             * 
             * @type String
             */
            titleIcon: '',
            
            /**
             * <p>Default title text</p>
             * 
             * @type String
             */
            titleText: '',

            /**
             * <p>Define inline CSS rules applied to TitleBar</p>
             * 
             * @type String 
             */
            titleCssText: '',
             
             /**
              * 
              * <p>Flag to show/hide empty titlbar.</p>
              * <p>Empty TITLEBEar means no icon and no text. Default value is 'false' - do not show empty titlbars
              * @type Boolean
              * @default false
              */
            showEmptyTitlebar: false,
            
            /**
             * <p>Indicate whether banding effect should be turned on for data rows.</p>
             * <p>The default is true</p>
             * 
             * @type Boolean
             * @default true
             */
            banding: true,
            
            /**
             * <p>Flag to determine whether an empty icon element should still occupy space</p>
             * 
             * <p>This is applied mainly for content type 'icon_text' where the leading icon may not provided.
             * Normally the icon node always occupy space even there is no actual icon to cause some leading space in 
             * front of text. In some cases, this may be not what expected, then set this property to 'true' to get rid of the space </p>
             * 
             * @type Boolean
             * @default true
             */
            hideEmptyIconNode: true,
            
            /**
             * <p>Content provider. It is an instance of mstrmojo.MCListBoxCP and should be instantiated at initialization.</p>
             *
             * <p>The content provider will send xhr request to server for data. The returned data should be formatted as Column data, Rows data, and titlebar data.
             * Each instance should have its own content provider, so it can only be instantiated in init().</p>
             * 
             * @type Object
             */
            cp: null,
            
            /**
             * <p>Header items data array.</p>
             * 
             *  <dt>Object format: </dt>
             *  <dd>
             *         columns: [{},...] //Array of objects, each is for one column. 
             * </dd>
             * 
             * @type Array
             */
            columns: null,
            
            /**
             * <p>Data items</p>
             * 
             *  <ddt>Object format: </dt>
             *  <dd>
             *     items: [[{},{}], ...] //Array of Array of objects, each sub-array is one row, each object in sub-array is one cell
             *  </dd>
             * @type Array
             */
            items: null,
 
            
            /**
             * <p>Widget level flag to enable/disable column sorting</P>
             * @type Boolan
             * @default true
             */
            sortable: true,

            /**
             * <p>Widget level flag to enable/disable column resizing</P>
             * @type Boolan
             * @default true
             */
            resizable: true,

                        
            /**
             * <p>Override</p>
             */
            /**
             * <p>html preffixed to items section markup</p>
             * @private
             * @ignore
             */
            _markupPrefix: function() {
                var ir = this.itemRenderer;
                return (ir && ir.markupPrefix) ||
                        (    '<table class="'+ 
                                this.tableCssClass +
                                '" style="' + 
                                this.tableCssText + 
                                '" cellspacing="0" cellpadding="0"><tbody>');
            },
            
            /**
             * <p>html suffixed to items section markup</p>
             * @private
             * @ignore
             */
            _markupSuffix: function() {
                var ir = this.itemRenderer;
                return (ir && ir.markupSuffix) || '</tbody></table>';
            },
            
            /**
             * <p>html prefixed to each group of items' markup</p>
             * @private
             * @ignore
             */
            _itemGroupPrefix: function(idx) {
                var ir = this.itemRenderer,
                    s = this.rowCssText ? 'style="' + this.rowCssText + '"' : '',
                    c = this.rowCssClass + (idx % 2 === 1 ? ' even': ''); //for adding banding effect
                
                //if it's even-th row, add a css class to that row 
                c = c ? 'class="' + c + '"' : '';
                return (ir && ir.itemGroupPrefix) || ('<tr ' + c + '' + s + '>');
            },
            
            /**
             * <p>html suffixed to each group of items' markup</p>
             * @private
             * @ignore
             */
            _itemGroupSuffix: function() {
                var ir = this.itemRenderer;
                return (ir && ir.itemGroupSuffix) || '</tr>';
            },
            
            /**
             * <p>html prefixed to each item's markup</p>
             * @private
             * @ignore
             */
            _itemPrefix: function() {
                var ir = this.itemRenderer,
                    c = this.cellCssClass ? 'class="' + this.cellCssClass + '"' : '',
                    s = this.cellCssText ? 'style="' + this.cellCssText + '"' : '';
                
                return (ir && ir.itemPrefix) || ('<td ' + c + ' ' + s + '>');
            },
            
            /**
             * <p>html suffixed to each item's markup</p>
             * @private
             * @ignore
             */
            _itemSuffix: function() {
                var ir = this.itemRenderer;
                return (ir && ir.itemSuffix) || '</td>';
            },
            
            /**
             * <p>Get the first child node of the table cell with given index.</p>
             * 
             * @param {Integer} idx Index of target table cell. 
             * @private
             * @ignore
             */
            _getItemNode: function(idx) {
                // ListBase recorded the table node as itemsNode
                var t = this.itemsNode,
                    rs = t && t.rows,
                    r = rs && rs[idx / rs.length - 1];
                return r && r.cells[idx % rs.length - 1].firstChild;
            },
            
            /**
             * <p>Renderer for each item type.</p>
             * <p>Each renderer function will be associated with corresponding 'columns' item as its 'render' function based on its 'type' property</p>
             * @type Object  
             */
            itemRenderer: {
                icon: function(item, idx, widget) {
                        //if no icon is specified, hide its placeholder.
                        if (widget.hideEmptyIconNode) {
                            item.icon = item.icon || 'none';
                        }
                        return '<div><div class="mstrmojo-MultiColumnListBox-icon ' + item.icon + '" title="' + item.v + '"/></div>';
                    },
                    
                text: function(item, idx, widget) {
                        return '<div class="mstrmojo-MultiColumnListBox-text" edt="1">' + item.v + '</div>';
                    },
                    
                icon_text: function(item, idx, widget) {
                        //if no icon is specified, hide its placeholder.
                        if (widget.hideEmptyIconNode) {
                            item.icon = item.icon || 'none';
                        }
                        return '<div class="mstrmojo-MultiColumnListBox-iconText">' + 
                                    '<span class="mstrmojo-MultiColumnListBox-icon ' + item.icon + '" title="' + item.v + '" ></span>'+ 
                                    '<span edt="1">' + item.v + '</span>'+ 
                                '</div>';
                    },
                    
                checkbox: function(item, idx, widget) {
                        return '<div><input class="mstrmojo-MultiColumnListBox-checkbox" type="checkbox"  ' + item.v + '/></div>';
                    },
                    
                link: function(item, idx, widget) {
                        return '<div class="mstrmojo-MultiColumnListBox-link">'+ 
                                    '<a target="' + item.target + '" href="' + item.url + '" class="mstrmojo-MultiColumnListBox-link">'+ 
                                        '<span>' + item.v + '</span>'+ 
                                    '</a>'+ 
                                '</div>';
                    },
                
                rowHeight: 20
            },
            
            /**
             * <p>MultiColumnListBox Control layout</p>
             * 
             * <p>This is the MultiColumnListBox Control's HTML structure. It has container level &lt;DIV&gt; and empty data &lt;TABLE&gt;s. The actual data will be sent down from server as <br/>
             * content provider data model and dynamically build data rows and insert into the aforementioned empty data &lt;TABLE&gt;s. </p>
             * 
             * @type String
             */
            markupString: 
                        '<div id="{@id}" class="mstrmojo-MultiColumnListBox {@cssClass}" style="{@cssText}; xxwidth:{@width}; left:{@left}; top:{@top};">' +
                            '<div class="mstrmojo-MultiColumnListBox-titlebar" style="width:{@width}; {@titleCssText};">'+
                                '<span class="mstrmojo-MultiColumnListBox-icon {@titleIcon}"></span>'+
                                '<span class="mstrmojo-MultiColumnListBox-title">{@titleText}</span>'+
                            '</div>' +
                            '<div id="{@id}-MultiColumnListBox-container" class="mstrmojo-MultiColumnListBox-container" style="width:{@width};">' +
                                '<div id="{@id}-headersScrollBox" class="mstrmojo-MultiColumnListBox-headersScrollBox" style="xxwidth:{@width};">' +
                                    '<div id="{@id}-headersContainer" class="mstrmojo-MultiColumnListBox-headersContainer" style="xxwidth:{@width};" '+ 
                                            'onclick="mstrmojo.all[\'{@id}\'].captureDomEvent(\'sort\', self, arguments[0]);" '+
                                            'onmousedown="mstrmojo.all[\'{@id}\'].captureDomEvent(\'mousedown\', self, arguments[0]);" '+
                                            '>'+
                                        '{@headersHtml}' +    
                                    '</div>'+
                                '</div>' +
                                //In line below, 'max-height' is set so to show v-scrollbar when necessary.
                                //BUT IE8 (standards mode) got a bug that applies 'max-height' as 'height' whenever h-scrollbar is shown.
                                //This webpage says it wont get fixed till next release: https://connect.microsoft.com/IE/feedback/ViewFeedback.aspx?FeedbackID=408759
                                //A workaround is currently applied to 'mouseup' event handler
                                '<div id="{@id}-itemsScrollBox" class="mstrmojo-MultiColumnListBox-itemsScrollBox" style="max-height:{@height}; xxwidth:{@width};" >' + 
                                    '<div id="{@id}-itemsContainer" class="mstrmojo-MultiColumnListBox-itemsContainer" style="xxwidth:{@width};" ' + 
                                            'onclick="mstrmojo.all[\'{@id}\'].captureDomEvent(\'edit\', self, arguments[0]);" ' + 
                                            '>' +
                                        '{@itemsHtml}' +
                                    '</div>'+
                                '</div>' +
                            '</div>' + 
                        '</div>',    
                
            /**
             * <p>Collection of references to DOM nodes.</p>
             * 
             * @type Object
             */
            markupSlots: {
                headersContainerNode: function(){return this.domNode.lastChild.firstChild.firstChild;}, //DIV.headersContainer
                itemsContainerNode: function(){return this.domNode.lastChild.lastChild.firstChild;}, //DIV.itemsContainer
                scrollboxNode: function(){return this.domNode.lastChild.lastChild;}  //DIV.itemsScrollBox
            },
            
            /**
             * <p>Html string containing header columns &lt;TABLE&gt;</p>
             * <p>This property will be cached once rendered so that it wont need being re-rendered again when sorting</p>
             * 
             * @private
             * @ignore
             * 
             * @type String
             */
            _headersHtml: null,
            

            /**
             * <p>Override</p>
             * <p>Returns an array of HTML strings as a &lt;table&gt; with a single &lt;tbody&gt; whose rows contain the data from the items
             * of a given range of indices.</p>
             * 
             * <p>This &lt;table&gt; will serve as the DATA section.</p>
             * 
             * @private
             * @ignore
             * 
             * @param {Integer} start First row index to be rendered 
             * @param {Integer} end Last row index to be rendered 
             * @param {String} markupPrefix Markup prefixed to the list
             * @param {String} markupSuffix Markup suffixed to the list
             * @param {String} itemPrefix Markup prefixed to each list item
             * @param {String} itemSuffix Markup suffixed to each list item
             * @param {Array} data (Optional) The data array whose (start, end) sub-array will be rendered into html. 
             *                      This is optional parameter, if not provided, 'this.items' will be applied.
             * 
             * @return {Array} Array of html strings.
             */
            _buildItemsMarkup: function(start, end, markupPrefix, markupSuffix, itemPrefix, itemSuffix, data) {
                // For performance, we generate the HTML as an array of small strings, which the caller can then join when needed.
                
                // Declare a new array for our HTML string output.
                var markup = [],
                    count = 0,
                    itemGroupSuffix = this._itemGroupSuffix && this._itemGroupSuffix();

                // Add the "<table><tbody>" to our output array. 
                markup[count++] = markupPrefix;

                // Loop thru the request items. For each item… 
                for (var i = start; i <= end; i++) { 
                    // Add the "<tr>" to our output array. 
                    markup[count++] = this._itemGroupPrefix && this._itemGroupPrefix(i) || "<tr " + ((i % 2 === 1)? 'class="even"' : '') + ">";

                    // Walk the columns list. For each column.. 
                    for (var j = 0, cnt = this.colCount; j < cnt; j++) { 
                        // Add the "<td>" to our output array. 
                        markup[count++] = itemPrefix || "<td>";

                        // Ask the itemRenderer for the contents inside the <td> for this item. 
                        markup[count++] = this.columns[j].render((data && data[j]) || this.items[i][j], i*j, this);

                        // Add the "</td>" to our output array. 
                        markup[count++] = itemSuffix || "</td>"; 
                    }
                    
                    // Add the "</tr>" to our output array. 
                    markup[count++] = itemGroupSuffix || "</tr>"; 
                }

                // Add the "</tbody></table>" to our output array. 
                markup[count++] = markupSuffix;

                return markup;
            }, //end _buildItemMarkup
            
            /**
             * <p>Compute columns widths</p>
             * 
             * <p>Columns widths are stored in array which should be updated when column resizing ends. 
             * Once updated, it should notify to update style property in corresponding &lt;COL&gt; node. 
             * 
             * Columns widths may be specified as array of constants when creating Control instance, or 
             * come with data from server;
             * 
             * If no columns widths is found, header cells' DOM property 'offsetWidth' value will be used to
             * build this array to apply as default columns widths.
             * </p> 
             * 
             * @private
             * @ignore
             */
            _buildColWidths: function() {
                //get current <COL> widths config or initialize it to []
                this.colWidths = this.colWidths || [];
                
                //if no column width specified, default col width will be computed based on header column layout
                var cws = this.colWidths;
                if (cws.length === 0) { //colWidth array not initialized yet
                    for (var i= this.colCount - 1; i > -1; i --) {
                        cws[i] = this.headersNode.rows[0].cells[i].offsetWidth;
                    }
                }
                
                //Compute HEADER and DATA <TABLE> width by summing up COL width
                //Fixed Width Mode - <TABLE> should have style width set.
                var w = 0;
                for (var j = cws.length - 1; j > -1; j --) {
                    w += cws[j];
                }
                //apply the computed width
                this.itemsNode.style.width = this.headersNode.style.width = w + 'px';
            },


            /**
             * <p>Build &lt;COLGROUP&gt; node.</p>
             * 
             * <p>The same &lt;COLGROUP&gt; will be appended to both HEADER and DATA &lt;TABLE&gt; as their first childNode.
             * If &lt;COLGROUP&gt; already exists, then will just update the style width of corresponding &lt;COL&gt;, this happens when do column resizing
             * </p>
             * 
             * @private
             * @ignore
             */
            _buildColGroup: function _buildColGroup() {
                
                //get columns widths
                this._buildColWidths();
                
                //create <COLGROUP> or update <COL> style width
                var ci = this.resizingIndex, //index of the column being resized
                    cws = this.colWidths,
                    cgs = this.colGroups;
                
                //<COLGROUP> already built, now update style
                if (cgs && cgs.length == 2 && cgs[0].childNodes.length == this.colCount) {
                    if (ci !== null && ci >= 0) { 
                        cgs[0].childNodes[ci].style.width = cws[ci] + 'px';
                        cgs[1].childNodes[ci].style.width = cws[ci] + 'px';
                    }
                }
                else { //otherwise, build <COLGROUP>
                    var cg = document.createElement('colgroup');
                    for (var i=0, cnt = this.colCount; i < cnt; i++) {
                        var col = document.createElement('col');
                        col.style.width = cws[i] + 'px';
                        cg.appendChild(col);                    
                    }
                    
                    /**
                     * <p>Insert &lt;COLGROUP&gt; as HEADER and DATA &lt;TABLE&gt's firstChild or replace existing one.</p>
                     * @inner
                     * @param {HTMLElement} w - which table
                     * @param {HTMLElement} cg - colgroup node
                     */
                    var fnCG = function(w, cg) {
                        w[(w.firstChild.tagName.toLowerCase()!='colgroup')? 'insertBefore': 'replaceChild'](cg, w.firstChild);
                    };
    
                    //insert <COLGROUP> into HEADER Table
                    fnCG(this.headersNode, cg);
    
                    //insert a clone of <COLGROUP> into Data Table
                    var cg2 = cg.cloneNode(true);
                    fnCG(this.itemsNode, cg2);
                    
                    //Save both <COLGROUP> DOM nodes references to update column width when resizing column.
                    this.colGroups = [cg, cg2];
                    
                    //WebKit-browser workaround:
                    //Need to reset table-layout to reflect the new inserted <COLGROUP>
                    this._webKit_repaint();
                }
            },
            
            /**
             * <p>WebKit-based browser, need to reset table-layout to reflect the new inserted &lgt;COLGROUP&gt;</p>
             *  
             * @private
             * @ignore
             */
            _webKit_repaint: function() {
                
                if (mstrmojo.dom.isWK) {
                    var ns = [this.headersNode, this.itemsNode];
                   
                    /**
                     * @inner
                     * @param {String} tl CSS table-layout - 'auto' or 'fixed'
                     */
                    var fnTL = function(tl){
                        for (var n in ns) {
                           if (ns[n]) {
                               ns[n].style.tableLayout = tl || 'fixed';
                           }
                        }
                    };
                    
                    //force repaint
                    fnTL('auto');
                    self.setTimeout(fnTL, 1);
                }
            }, //end _webKit_repaint()
            

            /**
             * <p>Constructor</p>
             * 
             * @contructor
             * @extends mstrmojo.ListBox
             * @param {Object} props Properties defined in new instance
             */
            init: function(props) {
            	this._super(props);
            	
                //setup incremental rendering properties:
                this.scrollboxHeight = parseInt(this.height, 10) || 200; //determine how many rows in view port
              
                //create an instance of content provider class
                this.cp = this.cp || new mstrmojo.MCListBoxCP();
            },//end init()
            
            
            /**
             * <p>Override</p>
             * <p>Setup properties values from Data Model before rendering</p>
             */
            preBuildRendering: function preBuildRendering() {
                if (this._super) this._super();
                
                var cp = this.cp;
                
                //if there is no data yet. send request to server
                if (cp.items === null && cp.columns === null && cp.ds && cp.ds.length > 0) {
                    
                    //request data from servers
                    cp.fetch();
                    
                } else {
                    //means no server request needed
                    cp.dataLoaded = true;
                }
                
                //update cssclass
                if (this.resizable) {
                    this.cssClass += ' resizable ';
                }
            },
            
            
            /**
             * <p>Override</p>
             * 
             * <p>Build widget HTML.</p>
             * <p>This function will wait till data is ready when it is retrieved from remote source</p>
             */
            buildRendering: function() {
                var me = this,
                    cp = this.cp;
                
                //if data is loaded, start rendering html 
                if (cp && cp.dataLoaded && (cp.columns || cp.items)) {
                
                    //initialization
                    this.columns = cp.columns;
                    this.items = cp.items;
                    this.colCount = cp.columns.length; //store number of columns
                    this.titleIcon = cp.titlebar.icon;
                    this.titleText = cp.titlebar.v;
                    this.itemRenderer = cp.itemRenderer || this.itemRenderer; //item renderers can come with data from server, or use predefined.
                    
                    //hide empty titlebar
                    if (!this.titleIcon && !this.titleText && !this.showEmptyTitlebar) {
                        this.titleCssText = 'display:none';
                    }
                    
                    var clms = this.columns,
                        ir = this.itemRenderer;
                    
                    //associate item renderer to each column for that item type:
                    for (var i = this.colCount - 1; i >= 0; i --) {
                        clms[i].render = ir[clms[i].type];
                    }
                    
                    //initialize <COL> widths array with 'width' properpty specified in column item definition
                    //If apply 'auto' columns layout, should wait till HTMLElements ready then read clientWidth of each <COL> 
                    var cws = this.colWidths;
                    if (!this.autoColWidth && (!cws || cws.length === 0)) {
                        cws = [];
                        for (i = this.colCount - 1; i > -1; i --) {
                            cws[i] = parseInt(clms[i].width, 10) || this.minColWidth;
                        }
                        this.colWidths = cws;
                    }
                    
                    //Now all data ready, start rendering
                    //Set the headersHtml property to an HTML string for column headers.
                    //render/cache column header html
                    this.headersHtml = this.headersHtml || this._buildItemsMarkup(
                                                                        0, 0,
                                                                        this._markupPrefix && this._markupPrefix(),
                                                                        this._markupSuffix && this._markupSuffix(),
                                                                        this._itemPrefix && this._itemPrefix(),
                                                                        this._itemSuffix && this._itemSuffix(),
                                                                        clms ).join('');

                    //render and insert new HTMLElement into DOM.
                    this._super();    

                    // Record pointer to the newly constructed TABLE for future reference.
                    if (!this.headerNode) {
                        this.addSlots({headersNode: this.headersContainerNode.firstChild});
                    }

                    //Adjust Container <DIV>'s width by scrollbar width when vertical scrollbar shows
                    var bc = this.itemsContainerNode;
                    if (bc.firstChild.offsetHeight > bc.parentNode.clientHeight) {
                        bc.style.width = (bc.offsetWidth - 17) + 'px';
                        this.headersContainerNode.style.width = bc.style.width;
                    }

                    //build <COLGROUP> and insert to each <TABLE>
                    this._buildColGroup();

                    //attach h-scroll event handler with original v-scroll event handler
                    //To sync HEADER and DATA nodes scrolling
                    mstrmojo.dom.attachEvent(this.scrollboxNode, 
                                             'scroll', 
                                             function(e) {
                                                    me.headersContainerNode.scrollLeft = mstrmojo.dom.eventTarget(window, e).scrollLeft;
                                             });
                    
                    //TEST:
                    //this.postBuildRendering();
                    //END TEST
                    this.hasRendered = !!this.domNode;
                } else {
                    //if data not loaded yet, wait...
                    window.setTimeout(function(){me.buildRendering();}, 100);
                }
                
                return true;
            },
            
            
            
//            postBuildRendering: function() {
//                if (this._super)  this._super();
//            	
//            	//TEST:
//            	this.scrollboxNode && mstrmojo.resizableCorner.add(this.scrollboxNode.parentNode);
//            	this.scrollboxNode && mstrmojo.resizableCorner.add(this.scrollboxNode.parentNode); 
//            	this.scrollboxNode && mstrmojo.resizableCorner.add(this.scrollboxNode.parentNode); 
//            	//END TEST:
//            },
            
            /**
             * <p>Sorting: Click event handler to do Column Sorting</P>
             *
             * <p>Event target should be DIV inside HEADER &lt;TD&gt;. If clicking on &lt;TD&gt; directly, should ignore it.</p>
             * 
             * @private
             * @param {HTMLWindow} hWin The current window object.
             * @param {DOMEvent} e The DOM event associated with 'click' on Column Header
             */
            onsort: function(evt) {
                if (!this.sortable) return false;
                
                var hWin = evt.hWin, e = evt.e;
                
                //get event target element
                var tgt = mstrmojo.dom.eventTarget(hWin, e);
                if (tgt) {
                    //get target cell which is ancestor of this target element
                    var tgtTD = mstrmojo.dom.findAncestorByName(tgt, 'td', false, this.domNode);
                    
                    //we find one ancestor TD, means we're clicking on non-empty header cell content element DIV.
                    //go ahead to do sorting
                    if (tgtTD) {

                        //get the index of target column to sort on
                        this.sortIndex = tgtTD.cellIndex;

                        //if this column is sortable
                        if (this.columns[tgtTD.cellIndex].sortable) {

                            //toggle sort direction
                            this.sortDirection = !this.sortDirection; 

                            //sort data and save back
                            this.items = mstrmojo.array.deepSortArr(this.items, 'v', this.sortIndex, this.sortDirection);

                            //re-fresh <TABLE>s after data modification:
                            this.refresh();
                        }
                    }
                }
            }, // end onsort()
            
            
            /**
             * <p>When data changed, like after sorting, call to refresh display by re-rendering</p>
             */
            refresh: function() {
                //reset pointer to inline-editor and resizing handle
                this.editor = null;
                this.resizeHandle = null;
                
                //save scrollLeft
                var sl = this.headersContainerNode.scrollLeft;
                
                //call super to un-render and then render html.
                this._super();
                
                //restore <COLGROUP> by using the saved copy
                for (var i in [0, 1]) {
                    var tbl = [this.headersNode, this.itemsNode][i];
                    if (tbl && tbl.firstChild.tagName.toLowerCase() != 'colgroup') {
                        tbl.insertBefore(this.colGroups[i], tbl.firstChild);
                    }
                }
                
                //restore scrollLeft
                if (this.headersContainerNode && this.scrollboxNode) {
                    this.headersContainerNode.scrollLeft = sl;
                    this.scrollboxNode.scrollLeft = sl;
                }
                
                //WebKit-browser workaround:
                //Need to reset table-layout to reflect the new inserted <COLGROUP>
                this._webKit_repaint();
                
            }, //end refresh()
            
            /***
             * <p>When data source 'ds' changes, call to re-render</p>
             * 
             * TODO: currently this function is only called directly when the property 'ds' changes by mclb.reRender();
             * Probably it can be associated with 'dsChange' event to trigger it.
             */
            reRender: function() {
                //reset these properties
                this.cp.columns = null;
                this.cp.items = null;
                this.cp.dataLoaded = false;
                this.colWidths = null;
                this.colGroups = null;
                this.headersHtml = null;
                
                //re-render
                this.refresh();
            }, //end reRender()
            
            
            /**
             * <p>'Click' event handler to edit Data cell content.</p>
             * 
             * <p>When clicking on a Data cell which is editable, an inline editor will be displayed to allow editing the cell content.
             * 'Enter' or clicking outside the editor will hide the editor and update the cell content and </p>
             * 
             * @private
             * @param {HTMLWindow} hWin The current window object.
             * @param {DOMEvent} e The DOM event associated with 'click' on &lt;TD&gt;
             */
            onedit: function(evt) {

                var hWin = evt.hWin, e = evt.e;
                
                //find editing target
                var tgt = mstrmojo.dom.eventTarget(hWin, e);

                //find the target cell 
                var tgtTD = mstrmojo.dom.findAncestorByName(tgt, 'td', true);

                //clicked on cell in editable column and editable Element?
                //Each editable Element should have attribute 'edt' set to '1'
                if (tgtTD && tgt && this.columns[tgtTD.cellIndex].editable) 
                {
                    //target cell index
                    this.rowIndex = tgtTD.parentNode.rowIndex;
                    this.cellIndex = tgtTD.cellIndex;
                    
                    switch (tgt.tagName.toLowerCase()) {
                        case 'div':
                        case 'span':
                           if (tgt.getAttribute('edt')) {
                               //re-use cached or create new InlineEditor instance
                               var edi = this.editor || new mstrmojo.InlineEditor();

                               //create the actual editor HTML
                               if (!edi.editor) {
                                   edi.render();

                                   //handle Data update when editing is done and target is set to null.
                                   edi.attachEventListener("targetChange", 
                                                           this.id,  
                                                           function(hWin, e) {
                                                               this.items[this.rowIndex][this.cellIndex].v = this.editor.editor.value;
                                                           });

                                   //save editor for re-use
                                   this.editor = edi;

                                   //append editor node to DOM
                                   this.itemsContainerNode.appendChild(edi.editor);
                               }

                               //update the editor's target DOMNode
                               edi.setTarget(tgt);

                               //bring up the editor
                               edi.show(
                                       {
                                           value: tgt.innerText || tgt.textContent,
                                           style: {
                                           top: tgtTD.offsetTop + 'px',
                                           left: tgtTD.offsetLeft + 'px',
                                           width: (tgtTD.clientWidth - 5) + 'px'  //adjust for padding
                                       }
                                       }
                               );
                           } //end if('edt')
                            break;
                            
                        case 'input':
                            this.items[this.rowIndex][this.cellIndex].v = tgt.checked ? 'checked' : '';  
                    }

                }//end if (tgt...)
                
            }, //end onedit()

            /**
             * <p>Mousedown event handler to resize column by dragging header column border.</p>
             * 
             * <p>This event handler is trigger when mousedown happens on header &lt;TD&gt;'s right margin area.</p>
             * 
             * <dt>Requirement: </dt>
             * <dd>The margin area is defined by each HEADER TD's 'padding-right', and the width of the margin area is currently defined in CSS.</dd>
             * 
             * @private
             * @param {HTMLWindow} hWin The current window object.
             * @param {DOMEvent} e The DOM event associated with 'mousedown' on HEADER &lt;TD&gt;
             */
            onmousedown: function(evt) {
                if (!this.resizable) return false;
                
                //disable text selection while resizing
//                hWin.document.onselectstart = function() {return false;};
                
                var hWin = evt.hWin, e = evt.e;
                
                
                // Get the target of the event.
                var tgt = mstrmojo.dom.eventTarget(hWin, e);
                
                //resizing starts only when mousedown on TD's border area where the event target is <TD>
                if (tgt && tgt.tagName.toLowerCase() == 'td')
                {
                    //if this column is resizable
                    if (this.columns[tgt.cellIndex].resizable !== false) {
                        
                        //resizing handle's position at mousedown event
                        var pos = tgt.offsetLeft + tgt.offsetWidth - this.itemsContainerNode.parentNode.scrollLeft; 
                        
                        //save index of the column to resize and mousedown position 
                        this.resizingIndex = tgt.cellIndex;
                        this.startx = mstrmojo.dom.getMousePosition(e).x;
                        
                        /**
                         * <p>Create a new resizing indicator line</p> 
                         * @inner
                         * @param {Integer} x initial x-coordinate
                         * @return {HTMLElement} 
                         */
                        var buildRszHandle = function(x) {
                            //create resizing handle element
                            var h = document.createElement('div');
                            h.className = 'mstrmojo-MultiColumnListBox-rzHandle';
                            h.style.left = x + 'px';

                            return h;                        
                        };
                        
                        //Update resizing handle position;
                        //Get cached resizing handle or create new one if not cached yet.
                        //This single resizing handle is used for all columns resizing.
                        var rh = this.resizeHandle || buildRszHandle(pos);
                        if (!this.resizeHandle || !mstrmojo.dom.contains(this.domNode, rh)) {
                            //if the resizing handle not cached yet:
                            this.resizeHandle = rh; //cache it
                            this.scrollboxNode.parentNode.appendChild(rh); //append to DOM
                        } else {
                            //otherwise just update position
                            rh.style.left = pos + 'px';
                        }
                        rh.style.display = 'block';
                        

                        //Prepare resizing (mousemove / mouseup event handling)
                        var me = this;
//                        var dmm = document.onmousemove, //backup current handler
//                            dmu = document.onmouseup;    //then restore when resizing is done
                        
//                        /**
//                         * <p>Attach mousemove event handler</p>
//                         * <p>When resizing ends, hide the resizing handle and update &lt;COLGROUP&gt; with the new column width.</p>
//                         * <p>Note: Attached to document so that resizing is not limited by grid container width.</p>
//                         * 
//                         * @param {Object} e Window event 
//                         */
//                        document.onmousemove = function(e) {
//                            //move resizing handle
//                            e = e || window.event;
//                            rh.style.left = Math.max(0, pos + (e.clientX||e.pageX) - me.startx) + 'px';
//                        };//end mousemove()
                        
                        
//                        /**
//                         * <p>Attach mouseup event handler</p>
//                         * <p>When resizing ends, hide the resizing handle and update &lt;COLGROUP&gt; with the new column width.</p>
//                         * 
//                         * @param {Object} e Window event 
//                         */
//                        document.onmouseup = function(e) {
//                            
//                            //cleanup after resizing is done
//                            if (rh) {
//                                //hide resizing handle
//                                rh.style.display = 'none';
//                                
//                                //detach/restore mousemove/mouseup handler
//                                document.onmousemove = dmm;// null; 
//                                document.onmouseup = dmu; //null;
//                            }
//                            
//                            var ri = me.resizingIndex;
//                            
//                            //we have a column to resize
//                            if (ri >= 0) {
//                                //update column widths and <col> style width
//                                me.colWidths[ri] = Math.max(me.minColWidth, me.colWidths[ri] + mstrmojo.dom.getMousePosition(e).x - me.startx);
//                                me._buildColGroup();
//                                          
//                                //reset
//                                me.resizingIndex = null; 
//                            }
//                            
//                        }; //end mouseup()
                        
                        
                        ///Alternative: add event listener and still keep original ones:
                        /**
                         * <p>'mousemove' event handler</p>
                         * <p>When resizing, update resizing handle position with mouse.</p>
                         * <p>Note: Attached to document so that resizing is not limited by grid container width.</p>
                         * 
                         * @inner
                         * @private
                         * @param {Object} e Window event 
                         */
                        var mousemove = function(e) {
                            rh.style.left = Math.max(0, pos + mstrmojo.dom.getMousePosition(e).x - me.startx) + 'px';
                        };
                        
                        /**
                         * <p>'mouseup' event handler</p>
                         * <p>When resizing ends, hide the resizing handle and update &lt;COLGROUP&gt; with the new column width.</p>
                         * @inner
                         * @private
                         * @param {Object} e Window event 
                         */
                        var mouseup = function(e) {
                            //cleanup after resizing is done
                            if (rh) {
                                //hide resizing handle
                                rh.style.display = 'none';
                                
                                //detach mousemove/mouseup handler
                                mstrmojo.dom.detachEvent(document, 'mousemove', mousemove);
                                mstrmojo.dom.detachEvent(document, 'mouseup', mouseup);
                            }
                            
                            //we have a column to resize
                            var ri = me.resizingIndex;
                            if (ri >= 0) {
                                //update column widths and <col> style width
                                me.colWidths[ri] = Math.max(me.minColWidth, me.colWidths[ri] + mstrmojo.dom.getMousePosition(e).x - me.startx);
                                me._buildColGroup();
                                          
                                //reset
                                me.resizingIndex = null; 
                                
                                //IE8 (standards mode) bug - max-height is applied as height when h-scrollbar shows
                                //Workaround - set scrollboxNode's height as itemsContainerNode's clientHeight
                                if (mstrmojo.dom.isIE) {
                                	var h = me.itemsContainerNode.clientHeight,
                                		sb = me.scrollboxNode;
                                	
                                    sb.style.height = h + 'px'; 
                                    if (sb.scrollWidth > sb.clientWidth) {
                                    	sb.style.height = h + 17 + 'px'; //add '17px' to show h-scrollbar below
                                    }
                                }
                            }
                        };
                        
                        //Attach event handlers
                        mstrmojo.dom.attachEvent(document, 'mousemove', mousemove);
                        mstrmojo.dom.attachEvent(document, 'mouseup', mouseup);
                        
                    } //end if (resizable..)
                    
                } //end if(tgt)
                
            }  //end mousedown()
        } //end instance members
        
    ); //end declare()
})();            




(function(){

    mstrmojo.requiresCls("mstrmojo.Widget");
    
    /**
     * <p>MultiColumn ListBox Content Provider (MCListBoxCP) is the content provider for this Control.</p>
     * 
     * <p>MCListBoxCP will read property data source 'ds' (which is url pointing remote data source) and send data request through xhr. </p> 
     * 
     * @class
     * @extends mstrmojo.Widget
     * @private 
     */
    mstrmojo.MCListBoxCP = mstrmojo.declare(
            //super
            mstrmojo.Widget,

            // mixins
            null,

            // instance members
            /**
             * <p>Content provider</p>
             *
             * <p>The content provider will send xhr request to server for data. The returned data should be formatted as Column (header) data, Items (rows) data, 
             * and Titlebar data (optional)
             * 
             * <p> Data format:</p>
             * <p>
             * columns: [{},...] //Array of objects, each is for one column. 
             * items: [[{},{}], ...] //Array of Array of objects, each sub-array is one row, each object in sub-array is one cell
             * titlebar:{icon:'icon-css-class', title:'title text string'}
             * </p>
             * 
             * @type Object
             * @lends mstrmojo.MCListBoxCP.prototype
             */
            {
                /**
                 * @ignore
                 */
                scriptClass: 'mstrmojo.MCListBoxCP',

                /**
                 * <p>URL points to remote data source.</p>
                 * @type String
                 */
                ds: null, 

                /**
                 * <p>Object contains 'icon' and 'v' for titlebar</p>
                 * <p>This is optional, and titlebar will be invisible if none of 'icon' and 'v' is provided'</p>
                 * @type Object
                 */
                titlebar: {
                    icon: '',
                    text: ''                        
                },
    
                /**
                 * <p>List of item renderer for each item type</p>
                 * <p>
                 *     for example: 
                 *  {
                 *    type1: function(){return markup_for_this_type_of_item}
                 *    type2: function(){return markup_for_this_type_of_item}
                 *    ...
                 *     }
                 * </p>
                 * 
                 * @type Object
                 */
                itemRenderer: null,
    
                /**
                 * <p>Column headers items</p>
                 * <p>This is an array of objects, each of which defines properties (like icon, text, editable ...) for one column header </p>
                 * <pre>
                 * Expected data object format: 
                 * {
                 *         type:## (string),
                 *         v:## (string),
                 *         icon:##(string,cssClass, optional)
                 *         width:##(int, optional),
                 *         sortable:##(boolean, optional)
                 *         editable:##(boolean, optional)
                 * }
                 * </pre>
                 * @type Array
                 */
                columns: null,
    
                /**
                 * <p>Data items</p>
                 * <p>This is an array of array of objects, each of sub-array defines one row of objects, each of which defines 
                 * properties (like icon, text, ...) for one Data cell </p>
                 * 
                 * <pre>
                 * Expected data object format: 
                 * {
                 *         v:## (string),
                 *         icon:##(string,cssClass)
                 * }
                 * </pre>
                 *  
                 * @type Array
                 */
                items: null,
    
                /**
                 * <p>Retrieve data by xhr request.</p>
                 */
                fetch: function fetch() {
                    //reset flag
                    this.dataLoaded = false;
    
                    //create xhr instance and callback interface object
                    var me = this,
                        xhr = new mstrmojo.SimpleXHR(),
                        callback = {
                            success: function(dm) {
                                        //save data objects 
                                        for (var p in dm) {
                                            me[p] = dm[p];
                                        }
                                        //set flag that data is ready
                                        me.dataLoaded = true; 
                                    },
                            failure: function(){alert('Data request failed!');}
                        };
                    
                    //send request
                    xhr.request('POST', this.ds, callback, {});
                }//end fetch()                

            } //end: content provider instance 

    ); //end declare()
})();
        



(function(){

    mstrmojo.requiresCls("mstrmojo.Widget");
    
    
     /**
     * <p>InlineEditor renders an single-line text editor control</p>
     * 
     * <p>This editor is for Inline Text Editing, it will be positioned on top of the target Element to be edited. </p> 
     * 
     * @class
     * @public 
     * @extends mstrmojo.Widget
     */
    mstrmojo.InlineEditor = mstrmojo.declare(
            
            //super class
            mstrmojo.Widget,
             
            //mixin
            null,
            
            /**
             * @lends mstrmojo.InlineEditor.prototype
             */
            {
                /**
                 * @ignore
                 */
                scriptClass: 'mstrmojo.InlineEditor',
                
                /**
                 * <p>Target HTMLElement to edit</p>
                 * @type HTMLElement
                 */
                target: null,
                
                /**
                 * <p>Visibility of this widget.</p>
                 * @type Boolean
                 * @default false
                 */
                visible: false,
                
                /**
                 * <p>The html string to be rendered into HTMLElement serving as Inline Editor</p>
                 * @type String
                 */
                markupString: '<input id={@id} class="mstrmojo-InlineEditor {@cssClass}"' + 
                                'onblur="mstrmojo.all[\'{@id}\'].captureDomEvent(\'blur\', self, arguments[0]);" ' +
                                'onkeyup="mstrmojo.all[\'{@id}\'].captureDomEvent(\'keyup\', self, arguments[0]);"' + 
                              '/>',
                
                /**
                 * <p>A set of DOMNodes references</p>
                 * @type Object
                 */
                markupSlots: {
                    editor: function() { return this.domNode; }
                },
                
                markupMethods: {
                	onvisibleChange: function() {this.domNode.style.display = this.visible ? 'block' : 'none';}
                },
                
                onvisibleChange: function(evt) {
                	/**
                	 * Firefox : MSTRWeb sets up 'mousedown' event handling in core.js when registerWindow() in order to 
                	 * avoid selecting text while dragging a dialog. This causes an issue that 'mousedown' outside this InlineEditor
                	 * wont trigger 'blur' event because 'mouse' event cancalled by the above setting.
                	 * To solve this, we have to attach another event to 'document' to listen 'mousedown' event by this InlineEditor
                	 * itself. If 'mousedown' is on any element other than the InlineEditor's INPUT tag, then manually call 'blur' handler.
                	 */
                	if (mstrmojo.dom.isFF) { 
	                	var me = this;
	                	this.md = this.md || function md(e){
								        				if (me.target) {
								        					var elTarget = mstrmojo.dom.eventTarget(self, e);
								        					if (!/InlineEditor/.test(elTarget.className)) {
								        						me.onblur();
								        					}
								        				}
							                		};
	                	
	            		if (this.visible) {
	            			mstrmojo.dom.attachEvent(document, 'mousedown', this.md); 
	            		} else {
	            			mstrmojo.dom.detachEvent(document, 'mousedown', this.md);
	            		}
	                }
            	},
            	
                /**
                 * <p>Set target DOMNode the editor to work on </p>
                 * 
                 * @param {HTMLElement} tgt The DOMNode whose text content to be edited.
                 */
                setTarget: function (tgt) {
                    this.target = tgt;
                },

                /**
                 * <p>Display the editor at given location</p>
                 * 
                 * <p>An object of properties should be passed to update editor position, default value</p>
                 *  
                 * @param {Object} props Properties to set on the editor
                 *         This object should be in format: 
                 *         {
                 *             value: {#value}, 
                 *             style: { 
                 *                         left: {#left}, 
                 *                         top: {#top}, 
                 *                         //....
                 *                         }
                 *         }
                 */
                show: function(props) {
                    var tgt = this.target,
                        editor = this.editor;
                    
                    //if there is no display properties specified, find them from 'target' element
                    //For these positioning properties to work, 'tgt' should have 'position:relative'.
                    if (!props) 
                    {
                        props = {
                                value: tgt.innerText || tgt.textContent,
                                style: {
                                            top: tgt.offsetTop + 'px',
                                            left: tgt.offsetLeft + 'px',
                                            width: tgt.offsetWidth + 'px'
                                        }
                            };
                    }
                    
                    
                    //update editor properties (style etc) and display:
                    for (var prop in props) {
                        var o = props[prop];
                        if (o instanceof Object) {
                            for (var p in o) {
                                editor[prop][p] = o[p];
                            }
                        }
                        else {
                            editor[prop] = o;
                        }
                    }
                    
                    //show editor
                    this.set('visible', true);
                    
                    //make editor ready to receive keyboard input
                    editor.focus();
                },

                
                /**
                 * <p>Handler 'blur' event to update target element's display</p>
                 */
                onblur: function(){
                    //update display
                    var t = this.target;
                    if (t) {
                    	t[t.innerText? 'innerText':'textContent'] = this.editor.value;
                    
                    	//hide editor
                    	this.set('visible', false);

                    	//triger event 'targetChange'
                    	this.set('target', null);
                    }
                },

                
                /**
                 * <p>Handler for 'Enter' key to update display by calling {@link mstrmojo.InlineEditor.onblur}.</p>
                 * 
                 * @param {HTMLWindow} hWin The current window object.
                 * @param {DOMEvent} e The DOM event 
                 */
                onkeyup: function(evt) {
                    var hWin = evt.hWin, e = evt.e;
                    
                    // Resolve the event for lesser browsers.
                    e = e || window.event;

                    //'Enter' is pressed
                    if ((e.keyCode || e.charCode) == 13) { 
                        //call 'onblur' handler to update display
                        this.editor.onblur(e);
                    }
                }
            } 
    );
})();



(function(){
	
	mstrmojo.requiresCls("mstrmojo.dom");
	
	/**
	 * <p>Attribute to be set on Resizable Corner element</p>
	 * 
	 * @private
	 * @ignore
	 * 
	 * @type String
	 */
	var _attr = 'rszc';
	
	
	/**
     * <p>A static class for HTMLElement to enable resizable corner handle.</p>
     * <p>This class should be as static by directly referencing the full class name: mstrmojo.resizableCorner</p> 
     * 
     * @class
     * @public
	 */
	mstrmojo.resizableCorner = {
			
		/**
		 * <p>Minimum dimension in pixels</p>
		 * 
		 * @private
		 * @ignore
		 * @type Integer
		 */
		_MIN_WIDTH: 10,
		
		/**
		 * <p>Minimum dimension in pixels</p>
		 * 
		 * @private
		 * @ignore
		 * @type Integer
		 */
		_MIN_HEIGHT: 10,
		
		/**
		 * <p>Holds a set of target HTMLElements having the resizable corners</p>
		 * 
		 * @private
		 * @ignore
		 * 
		 * @type Array
		 */
		_target: [],
		
		/**
		 * <p>Enable the given HTMLElement to have resizable corner</p>
		 * <dt>Requirement:</dt>
		 * <dd>The target element should have 'position: relative'</dd>
		 * 
		 * @param {HTMLElement} el Target element to be enabled with resizable corner.
		 */
		add: function(el) {
			var t = mstrmojo.resizableCorner._target;
			
			//if target element is not enabled with resizable corner yet:
			if (el && mstrmojo.array.indexOf(t, el) === -1) {
				//create HTMLElement as the corner resizing handle
				var rc = document.createElement('div');
				rc.className = 'rsz-corner';
				rc.id = _attr + mstrmojo.resizableCorner._target.length;
				rc.setAttribute(_attr, 1);

				//attach mousedown event handler to this handle node
				mstrmojo.dom.attachEvent(rc, 'mousedown', this.onstart );
				
				//append handle to target node
				el.appendChild(rc);
				el.setAttribute(_attr, 1);
				
				//save target node
				t.push(el);
				//mstrmojo.resizableCorner._target.push({el:el, rc:rc});
			}
		},
	
		/**
		 * <p>Disable the resizable corner on given HTMLElement</p>
		 * 
		 * @param {HTMLElement} el Target element to disable its resizable corner.
		 */
		remove: function(el) {
			var t = mstrmojo.resizableCorner._target;
			
			//now remove resizable corner
			//we expect it to be the last child
			var rc = el.lastChild;
			if (!rc.hasAttribute(_attr)) {
				//if not, find it by looping through childNodes with expected id
				//find index of the target element, which is suffix of the id of the target resizable corner node
				rc = document.getElementById(_attr + mstrmojo.array.indexOf(t, el));
			}
			el.removeChild(rc);
			
			//remove from cache array
			mstrmojo.array.removeItem(t, el);
		},
		
		/**
		 * <p>'mousedown' event handler on the corner resizing handle node </p>
		 * 
		 * @private
		 * @ignore
		 * 
		 * @param {DomEvent} e  
		 */
		onstart: function(e) {
			// Get the 'mousedown' event target
			var rc = mstrmojo.dom.eventTarget(window, e);
			if (rc && rc.tagName.toLowerCase() == 'div' && rc.hasAttribute(_attr) && rc.getAttribute(_attr) == '1') {
				// Disable text selection while resizing
				rc.ownerDocument.onselectstart = function() {return false;};
		
				// Get the cached target element
				var el = mstrmojo.resizableCorner._target[parseInt(rc.id.replace(new RegExp(_attr), ''), 10)],
					doc = el && el.ownerDocument;
		
				// Resizing starts only when : 
				if (el.hasAttribute(_attr) && el.getAttribute(_attr) == '1') {
					//initial dim and mouse position:
					var w0 = el.clientWidth,
						h0 = el.clientHeight,
						pos0 = mstrmojo.dom.getMousePosition(e);

					/**
					 * <p>'mousemove' event handler</p>
					 * <p>When mouse moves, update target node's dimension.</p>
					 * 
					 * @inner
					 * @private
					 * @param {DomEvent} e Window event 
					 */
					var onresize = function(e) {
						var pos1 = mstrmojo.dom.getMousePosition(e);
						el.style.width = Math.max(10, w0 + pos1.x - pos0.x) + 'px';
						el.style.height = Math.max(10, h0 + pos1.y - pos0.y) + 'px';
					};

					/**
					 * <p>'mouseup' event handler</p>
					 * <p>When resizing ends, do cleanup.</p>
					 * 
					 * @inner
					 * @private
					 * @param {DomEvent} e Window event 
					 */
					var onend = function(e) {
						//detach mousemove/mouseup handler
						mstrmojo.dom.detachEvent(doc, 'mousemove', onresize);
						mstrmojo.dom.detachEvent(doc, 'mouseup', onend);
					};

					//Attach event handlers
					mstrmojo.dom.attachEvent(doc, 'mousemove', onresize);
					mstrmojo.dom.attachEvent(doc, 'mouseup', onend);

				} //end if ('rszc'...)
	
			} //end if(rc)
	
		}  //end mousedown()

	};

})();

