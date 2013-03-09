(function () {
   
    mstrmojo.requiresCls(   
            "mstrmojo.dnd"
            );
    
    /**
     * Create avatar dom structure.
     */
    function _createAvatar(w){
        var d = document.createElement('div'),
            s = d.style,
            dn = w.domNode;
        d.className = "mstrmojo-DataGrid-avatar";
        s.height = dn.clientHeight + "px";
        dn.appendChild(d);
        w.avatar = d;
        return d;
    }
    
    /**
     * Return domNode position.
     */
    function _getMyX(w){
        var p = mstrmojo.dom.position(w.domNode, true);
        return p.x;
    }
    
    /**
     * The dom string used to create the resize handle.
     */
    function _RHString(i){
        return '<div class="mstrmojo-DataGrid-resizeHandle" unselectable="on" onselectstart="return false" rh="' + i + '"></div>';
    }
    
    /**
     * Whether it is resize handle.
     */
    function _getRHIndex(t){
        var rs = t.getAttribute("rh"),
            result = rs && parseInt(rs, 10);
        return result;
    }
    
    function _doNothing4Resizing(w, _super, ctxt){
        var s = ctxt.src,
            d = s && s.data,
            rsIdx = d && d.resizingIdx;
        if(!(rsIdx && rsIdx>0)){//not dragging the resize handle
            return _super && _super.apply(w,[ctxt]);
        }
    }
    
    /**
     * <p>Enables DataGrid to resize its columns.</p>
     */
    mstrmojo._CanResizeColumn = mstrmojo.provide(
        "mstrmojo._CanResizeColumn",
        /**
         * @lends mstrmojo._CanResizeColumn
         */
        {
            draggable: true,
            dropZone: false,  
            
            //ownAvatar: true,
            avatar: null,
            colSizeArray: null,
            
            resizableColumns: true, 
            resizeHandleWidth: 18,
            minColWidth: 5,
            
            
            /**
             * Override so that the avatar is re-attached to the new domNode when new items is set and the whole DataGrid is refreshed. 
             */
            postBuildRendering: function postBuildRendering(){
                if(this._super){
                    this._super();
                }
                if(this.avatar){
                    this.domNode.appendChild(this.avatar);
                }
                this.colSizeArray = null;
            },
            
            /**
             * Shall return the data related to this dragging. 
             * Note that ListBase2 already defines this function, need to override it. 
             */
            getDragData: function getDragData(ctxt){ 
                var s = ctxt.src,
                    n = s.node,
                    rsIdx = _getRHIndex(n);
                if(rsIdx && rsIdx > 0){//dragging on the resize handle
                    return {resizingIdx: rsIdx, startingX: s.pos.x, baseX:_getMyX(this)};
                } else {
                    if(this._super){
                        return this.dropZone && this._super(ctxt);
                    }
                }
                return null;
            },
            
            allowDrop: function allowDrop(ctxt){
                var s = ctxt.src,
                d = s && s.data,
                rsIdx = d && d.resizingIdx;
                if(rsIdx && rsIdx>0){//dragging the resize handle
                    return true;
                } else {
                    return this.dropZone; //shall make sure only allow dropping that is meaningful to this DataGrid. 
                }
            },
            
            ondragenter: function ondragenter(ctxt) {
                _doNothing4Resizing(this, this._super, ctxt);
            },
            
            ondragover: function ondragover(ctxt) {
                _doNothing4Resizing(this, this._super, ctxt);
            },
            
            ondragleave: function ondragleave(ctxt) {
                _doNothing4Resizing(this, this._super, ctxt);
            },
            
            ondrop: function ondrop(ctxt) {
                _doNothing4Resizing(this, this._super, ctxt);
            },
            
            
            /**
             * Judge whether or not it is dragging the resize handle. If so, return true;otherwise, return this._super if any.
             * For DataGrid, we also need to create its own avatar, and maintain its own drag starting position.
             */
            ondragstart: function ondragstart(ctxt){
                var s = ctxt.src,
                    d = s && s.data,
                    rsIdx = d && d.resizingIdx;
                if(rsIdx && rsIdx>0){//dragging the resize handle
                    var a = this.avatar || _createAvatar(this), //avatar shall not in ctxt in order to share among draggings
                        range;
                    
                    this.ownAvatar = true;
                    a.style.left = (d.startingX - d.baseX) + "px";
                    a.style.display = "block";
                    document.body.style.cursor = "col-resize";
                    
                    //create column size array, if not existed; 
                    var sa = this.colSizeArray; //colSizeArray shall not in ctxt in order to share among draggings
                    if(!sa){
                        var hc = this.headerContainerNode,
                        ht = hc && hc.getElementsByTagName('table')[0],
                        cls = ht.rows[0].cells;
                        
                        sa = [];
                        for(var i =0, len=cls.length;i<len;i++){
                            sa.push(cls[i].offsetWidth);
                        }
                        this.colSizeArray = sa;
                        this._firstTimeResize = true;
                    }
                    //determine the resize range
                    var mw = this.minColWidth;
                    range = [-sa[rsIdx-1] + mw, 
                                        (rsIdx == sa.length - 1) ? sa[rsIdx] - this.resizeHandleWidth - mw : sa[rsIdx] - mw]; 
                    d.resizingRange = range;
                    return true;//need to return true to indicate that it is ok to drag. 
                } else {
                    if(this._super){
                        return this._super(ctxt);
                    }
                }
            }, 
            
            

            /**
             * Need to move the avatar based on current dragging position and record the current avatar position. 
             */
            ondragmove: function ondragmove(ctxt){
                var s = ctxt.src,
                    d = s && s.data,
                    rsIdx = d && d.resizingIdx;                
                if(rsIdx && rsIdx>0){//dragging on the resize handle
                    var t = ctxt.tgt,
                        a = this.avatar,
                        rg = d.resizingRange,
                        mx = t.pos.x - d.startingX,
                        deltaX = Math.min(rg[1],Math.max(mx,rg[0]));
                    //determine the ending position based on allowable move range and current mouse position
                    d.deltaX = deltaX;
                    
                    if(a){
                        a.style.left = (d.startingX - d.baseX + deltaX) + "px";
                    }
                } else {
                    if(this._super){
                        this._super(ctxt);
                    }
                }
            },
            
            /**
             * Need to resize column based on the current position. 
             */
            ondragend: function ondragend(ctxt){
                var s = ctxt.src,
                    d = s && s.data,
                    rsIdx = d && d.resizingIdx;  
                if(rsIdx && rsIdx>0){//dragging on the resize handle
                    //resize all columns based on current ending position
                    var cg = this.titleColGroup,
                        cls = cg && cg.childNodes,
                        dcg = this.dataColGroup,
                        dcls = dcg && dcg.childNodes,
                        len = cls.length,
                        sa = this.colSizeArray,
                        deltaX = d.deltaX;
                    
                    //update the size array
                    sa[rsIdx - 1] = sa[rsIdx - 1] +  deltaX;
                    sa[rsIdx] = sa[rsIdx] - deltaX;
                    
                    //update the colGroup
                    if(this._firstTimeResize){
                        for(var i=0;i<len;i++){
                            cls[i].style.width = sa[i] + 'px';
                            dcls[i].style.width = sa[i] + 'px';                        
                        }
                        this._firstTimeResize = false;
                    }else{//only update the affected ones
                        cls[rsIdx - 1].style.width = sa[rsIdx - 1] + 'px';
                        dcls[rsIdx - 1].style.width = sa[rsIdx - 1] + 'px';     
                        cls[rsIdx].style.width = sa[rsIdx] + 'px';
                        dcls[rsIdx].style.width = sa[rsIdx] + 'px';                     
                    }               
                    
                    //reset avatar and cursor
                    this.avatar.style.display = "none";
                    document.body.style.cursor = "";   
                    this.ownAvatar = false;
                } else {
                    if(this._super){
                        this._super(ctxt);
                    }
                }
            }
        });
    
    mstrmojo.requiresCls(   
            "mstrmojo._CanResizeColumn",
            "mstrmojo.ListMapperTable",         
            "mstrmojo.WidgetList");
    
    function _buildColGroup(cls){
        var cg = document.createElement('colgroup'),
            len = cls.length,
            cl;
        for (var i=0; i < len; i++) {
            var col = document.createElement('col');
            cl = cls[i];
            if(cl.colWidth){
                col.style.width = cl.colWidth + 'px';
            }
            col.className = cl.colCss || ('col' + i);
            cg.appendChild(col);                    
        }
        return cg;
    }
    
    function _destroyHeaderWidgets(w){
        var hws = w._headerWidgets_,
            len = hws && hws.length;
        if(len>0){
            for(var i=0;i<len;i++){
                hws[i].destroy(true);
            }
        }  
    }
    
    /**
     * DataGrid is a widget that renders a list of data in table/grid form. Compared to a normal list or grid rendering, 
     * DataGrid offers the flexibility that each cell can be a widget, such as a DropDown or a Button. To use a DataGrid, 
     * you must configure the columns parameter, which is an array of objects. Each of these objects specifies how this 
     * column shall be rendered, either as a field value, or a string value returned by a renderer function, or as a widget, for example:
     * columns: [
     *          {headerText:'Users/UserGroups', headerCss: 'user-header', dataField:'name', colWidth: '50', colCss: 'user'},
     *          {headerText:'Access Rights', dataWidget:{scriptClass:'mstrmojo.Pulldown',onchange:function(evt){...}}},
     *          {headerWidget:{scriptClass:'mstrmojo.Button',onclick:function(evt){...}}, dataFunction:function(item, idx, w){return 'Value:' + item.n;}}
     *          ]
     * Also note that there are some other parameters can be configured using columns parameter, such as colWidth, colCss, and headerCss. 
     * colWidth is used to give this column an initial with, while colCss is used to give this column an css. These two parameters are
     * usually used to configure the initial size of each column in the DataGrid. Even though you can specify the columns of a DataGrid to 
     * be resizable (by setting parameter resizableColumns to true), you are assumed to make sure the initial size of title columns matches 
     * the size of its corresponding data column, either though colWidth or colCss together with CSS style. headerCss is used to give the header
     * of the column a class name, so that it can be formatted using CSS styles. 
     * 
     * More enhancements: now, you can make the header of any column to be a widget (using headerWidget). This can be used to provide 
     * interactivity to the header, such as when certain column header clicked, the DataGrid is sorted accordingly based on that corresponding 
     * column. 
     * 
     * The data passed into a DataGrid shall be set to items instance variable, which is an array of data, for example:
     * items: [
     *          {name: 'Administrator', did:'', rgts: 255},
     *          {name: 'Web Developer', did:'', rgts: 223},
     *          {name: 'Guest', did:'', rgts: 199}
     *          ]
     */
    mstrmojo.DataGrid = mstrmojo.declare(
        // superclass
        mstrmojo.WidgetList,
        // mixins
        [mstrmojo._CanResizeColumn],
        // instance members
        {
            scriptClass: "mstrmojo.DataGrid",
            
            banding: true,
            
            /**
             * Whether or not the columns of this DataGrid is resizable. 
             */
            resizableColumns: true,
            
            columns: null,
            
            items: null,
            
            listMapper: mstrmojo.WidgetListMapperTable,
            
            markupString: '<div id="{@id}" class="mstrmojo-DataGrid {@cssClass}" style="{@cssText}" mstrAttach:mousedown,mouseup>'
                    + '<div class="mstrmojo-DataGrid-headerContainer">{@headerHtml}</div>'
                    + '<div class="mstrmojo-DataGrid-itemsScrollBox" style="position:relative;">'
                        + '<div class="mstrmojo-DataGrid-itemsContainer" style="{@itemsContainerCssText}">{@itemsHtml}</div>'
                        + '<div class="mstrmojo-ListBase2-dropCue"><div class="mstrmojo-ListBase2-dropCue-inner"></div></div>'                        
                    + '</div>'
                + '</div>',
                
            markupSlots: {
                scrollboxNode: function(){return this.domNode.lastChild;},
                itemsContainerNode: function(){return this.domNode.lastChild.firstChild;},
                dropCueNode: function(){return this.domNode.lastChild.lastChild;},
                headerContainerNode: function(){return this.domNode.firstChild;}
            },
            
            itemFunction: function(item, idx, w){
                var c = new mstrmojo.DataRow({
                    columns: w.columns,
                    data: item,
                    idx: idx,
                    dataGrid: w
                });
                return c;
            },
            
            /**
             * Override to generate the header html.
             */
            preBuildRendering: function preBuildRendering(){
                var cls = this.columns,
                    len = cls.length,
                    out = ['<table class="mstrmojo-DataGrid-headerTable" cellspacing="0" cellpadding="0"><tr>'],
                    cl, w;
                this._headerWidgets = [];
                for(var i =0;i<len;i++){
                    cl = cls[i];
                    w = cl.headerWidget;
                    out.push('<td>');
                    if(i>0 && this.resizableColumns){
                        out.push(_RHString(i));
                    }
                    out.push('<div class="mstrmojo-DataGrid-headerText');
                    out.push(cl.headerCss ? ' ' + cl.headerCss : '');
                    if(w){
                        this._headerWidgets.push(mstrmojo.hash.copy(w));
                        out.push('" w="1">');
                    } else {
                        out.push('">');
                    }
                    out.push(cl.headerText ? cl.headerText : '&nbsp');
                    out.push('</div>');                  
                    out.push('</td>'); 
                }
                out.push('</tr></table>');
                this.headerHtml = out.join('');
                if(this._super){
                    this._super();
                }
            },
                  
            /**
             * Override to build colGroups and update both header and data tables.
             */
            postBuildRendering: function postBuildRendering(){
                if(this._super){
                    this._super();
                }
                
                //build header widgets and render them
                var hws = this._headerWidgets,
                    len = hws.length;
                if(len > 0){
                    this._headerWidgets_ = [];
                    var divs = this.headerContainerNode.getElementsByTagName('div'),
                        phs = mstrmojo.array.filter(divs,function(div){
                            return div.getAttribute('w') == '1';
                        }),
                        w;
                    for(var i=0;i<len;i++){
                        hws[i].placeholder = phs[i].firstChild;
                        hws[i].dataGrid = this;
                        w = mstrmojo.registry.ref(hws[i]);
                        w.render();
                        this._headerWidgets_.push(w);
                    }
                }
                
                
                //insert colGroup element
                var cg = _buildColGroup(this.columns),
                    dcg = cg.cloneNode(true),
                    hc = this.headerContainerNode,
                    ht = hc && hc.getElementsByTagName('table')[0],
                    dc = this.itemsContainerNode,
                    dt = dc && dc.getElementsByTagName('table')[0];
                this.titleColGroup = cg;
                this.dataColGroup = dcg;
                if(ht && dt){
                    ht.insertBefore(cg,ht.firstChild);
                    dt.insertBefore(dcg,dt.firstChild);
                }
                
            },
            
            refresh: function refresh(postUnrender){
                _destroyHeaderWidgets(this);
                if(this._super){
                    this._super(postUnrender);
                }
            },
                
            destroy: function dst(skipCleanup) {
                _destroyHeaderWidgets(this);
                this._super();
            },
            
            unrender: function unrn(ignoreDom) {
                var hws = this._headerWidgets_,
                    len = hws && hws.length,
                    hw;
                if(len>0){
                    for(var i=0;i<len;i++){
                        hw = hws[i];
                        if(hw && hw.hasRendered){
                            hw.unrender(true);
                        }
                    }
                }
                this._super(ignoreDom);
            }
            
        });
    
    mstrmojo.requiresCls(
            "mstrmojo.css",
            "mstrmojo.hash",
            "mstrmojo.Container");
    
    mstrmojo.DataRow = mstrmojo.declare(
            // superclass
            mstrmojo.Container,
            // mixins
            null,
            // instance members
            {
                scriptClass: "mstrmojo.DataRow",
                
                cssClass: "mstrmojo-DataRow",
                
                columns: null,
                
                markupMethods: {
                    onselectedChange: function(){ 
                        mstrmojo.css.toggleClass(this.domNode, "selected", this.selected);
                    }
                },
                
                buildDom: function(){
                    this.children = [];
                    var ph = document.createElement('tr'),
                        d = this.data,
                        idx = this.idx,
                        dataGrid = this.dataGrid,
                        css = this.cssClass,
                        cls = this.columns,
                        ch = this.children,
                        td,
                        cn = -1,
                        cl,
                        w;
                    
                    ph.setAttribute('id', this.id);
                    if(dataGrid.banding){
                        css += (idx%2 == 1) ? ' odd' : ' even';
                    }
                    ph.className = css;
                    
                    
                    for(var i = 0, len = cls.length; i<len; i++){
                        cl = cls[i];
                        w = (cl.dataWidgetBuilder && cl.dataWidgetBuilder(d)) || cl.dataWidget;
                        td = document.createElement('td');
                        ph.appendChild(td);                  
                        if(w) {
                            td.setAttribute('w', '1');
                            cn++;
                            ch.push(mstrmojo.hash.copy(w,{
                                slot:'slot'+cn,
                                data:d,
                                idx:idx,
                                dataGrid:dataGrid
                            }));
                        } else {
                            td.innerHTML = cl.dataFunction ? cl.dataFunction(d, idx, dataGrid) : '<div class="mstrmojo-DataRow-text">' + (mstrmojo.string.htmlAngles(d[cl.dataField || 'n']) || '&nbsp') + '</div>';     
                        }
                    }
                    this.initChildren();
                    return ph;
                },
            
                buildRendering: function bldRn() {            
                    // Call the inherited method to do the DOM construction.                
                    this._super();  
                    
                    //set up slots for widgets
                    var tds = this.domNode.childNodes,
                        len = tds.length,
                        slots = {},
                        ct = 0,
                        td;
                    for(var i=0;i<len;i++){
                        td = tds[i];
                        if(td.getAttribute('w') == '1'){
                            slots['slot' + ct] = td;
                            ct++;
                        }
                    }
                    this.addSlots(slots);      
                }
            });    
    
})();