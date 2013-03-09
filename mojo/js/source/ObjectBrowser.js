(function () {
    mstrmojo.requiresCls(
        "mstrmojo.Button",
        "mstrmojo.HBox",
        "mstrmojo.Box", 
        "mstrmojo.DropDownButton",
        "mstrmojo.Popup",
        "mstrmojo.WidgetTree",
        "mstrmojo.ObjectBrowserDataProvider",
        "mstrmojo.OBList",
        "mstrmojo.FishEye", 
        "mstrmojo.FishEyeContainer",
        "mstrmojo.SearchBox2",
        "mstrmojo.Booklet",
        "mstrmojo.IncFetch");

    var MTP = mstrmojo.meta.TP,

    getWidget = function (me, data) {
        var w = mstrmojo.insert({
            scriptClass: "mstrmojo.OBList",
            items: data
        });
        w.render();
        return w;

    },

    refreshCB = {
        success: function (res) {
            var me = this.ob,
            items = res.items,
            currPage = me.pageCache[me.currentPage]._w;
            currPage.set('items', items);
            this.ob = null;
            this.item = null;
            window.clearTimeout(me._btm);
            me.booklet.set('waiting', false);
        },
        failure: function (res) {
            window.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
            this.ob.booklet.set('waiting', false);
        }
    },

    fetch = function (me, item, cb) {
        var info = getFromCache(me, item, false),
        rev = !info;

        info = info || getFromCache(me, item, true);

        if (!info) {
            me._btm = window.setTimeout(function () {
                me.booklet.set('waiting', true);
            }, 300);
            cb.ob = me;
            cb.item = item;
            me.dataProvider.fetchFolderContents(me, item, cb);
        } else {
            openPage(me, item, info, true, rev);
        }
    },

    refresh = function (me, blockBegin, searchPattern, recursive) {
        fetch(me, {
            fid: me.pageCache[me.currentPage].did,
            blockBegin: blockBegin,
            searchPattern: searchPattern,
            recursive : recursive
        }, refreshCB);
    },

    checkCanGoUp = function (me, info) {
        //has ancestors
        var ha = info.anc;
        ha = ha && ha.items;
        ha = ha && ha[0];
        ha = ha && ha.items;

        me.set('canGoUp',!(!info.pf || !ha));
    },

    openPage = function (me, item, info, cached, reverse) {
        delete me._btm;
        var w;
        if (!cached) {
            w = getWidget(this, info.items);
            //Attach the event listener so the OB listen to the item selection change to navigate
            w.attachEventListener("change", me.id, "navigate");
        } else {
            w = info._w;
        }
        //Turn the page forward for the next item
        me.booklet.turn(w, !reverse);
        if (!cached) {
            //Update the cache
            cachePage(me, item, w, info);
        }
        me.set('currentFolder', info);
        //Move the page pointer, notifying any listener
        me.set('currentPage', me.currentPage + (reverse ? -1 : 1));
        checkCanGoUp(me, info);
    },

    fetchFolderCB = {
        success: function (res) {
            var me = this.ob;
            if(me){//410351; me can be null if we are in the middle of a request
                window.clearTimeout(me._btm);
                if(!res.items){
                    res.items = [{did:'empty',n:'('+mstrmojo.desc(2210)+')',t:'e'}]; //"(empty)"
                }
                openPage(me, this.item, res, false, false);
                this.ob = null;
                this.item = null;
            }
        },
        failure: function (res) {
            this.ob.booklet.set('waiting', false);
            if(this.ob.onError){
                this.ob.onError(res);
            }else{
                window.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
            }
        }
    },

    /*
     * Will store the widget on the next page position of the 
     * page cache, it will split the cache to destroy the rest 
     * of the elements to the right of the pointer, if any.
     */
    cachePage = function (me, item, w, info) {
        var dp = me.currentPage + 1;
        var l = me.pageCache.length;

        /*
         *  Check if the currentPage is the last one of the cache
         *  if not, then will destroy and remove the rest of it.
         * */
        for (var x = dp; x < l; x++) {
            me.pageCache[x]._w.destroy();
            delete me.pageCache[x].items;
        }
        me.pageCache = me.pageCache.slice(0, dp);
        info._w = w;
        info._k = item.k;
        me.pageCache[dp] = info;
        me.cacheChange();
    },

    getFromCache = function (me, item, reverse) {
        //See if there are more items to the left of the data position pointer
        var cp = me.currentPage + (reverse ? -1 : 1);
        if (me.pageCache.length > cp && cp >= 0) {
            var nextItem = me.pageCache[cp];
            if (nextItem._k == item.k) {
                return nextItem;
            }
        }
        return false;
    },

    clearCache = function (me) {
        var l = me.pageCache.length;
        for (var x = 0; x < l; x++) {
            me.pageCache[x]._w.destroy();
        }
        me.pageCache = [];
        me.currentPage = -1;
        me.cacheChange();
    },

    browseFolder = function (me, item) {
        
        if(item && item.acg == 33) { return; }//browse only, cannot read content
        
        var opener = {};
        if (item) {
            opener.k = item.did;
            opener.fid = item.did;
        } else {
            if (me.rootFolderID) {
                opener.k = me.rootFolderID;
                opener.fid = me.rootFolderID;
            } else if (me.rootFolderType) {
                opener.k = me.rootFolderType;
                opener.fty = me.rootFolderType;
            } else if(me.folderLinksContextId){
                opener.k = me.folderLinksContextId;
            }
        }
        fetch(me, opener, fetchFolderCB);
    },

    /*
     * This method will process the tree structure of the navigator,
     * 
     * Always display the first branch of the tree completely open with the 
     * current path.
     * 
     * We have two different behaviors:
     * - Show the complete ancestors hierarchy of the current folder up 
     *      to the project name and hide any shortcut that is in the current 
     *      folder ancestors path. This should be the default behavior for browsing
     *      objects, since you can use objects from anywhere.
     * - Show the ancestors hierarchy until we reach any shortcut and hide it.
     *      This should be the default behavior for save as, since you can't save
     *      as for example on the project root.
     */    
    procNavigationTree = function(me, tree, scts){
        if(!scts){
            return tree;
        }
        var shCmpPath = me.showCompletePath, //behavior true for showing the complete ancestors path, false for show until shortcut
        n = tree[0],
        ndid,
        lastLeaf; //We need to mark the leaf of the tree so we can't avoid navigating to it, since we are there already.
        //First, we need to mark of any shortcut that is on the ancestors hierarchy
        while(n){
            for(var scIx = 0; scIx < scts.length; /*nothing*/ ){
                if(n.did == scts[scIx].did){
                    //match! delete SC
                    scts.splice(scIx,1);
                    //Mark tree node as shortcut
                    n._isSc = true;
                }else{
                    scIx++;
                }
            }
            lastLeaf = n;
            n._open = true;
            n = n.items;
            n = n && n[0];
            if(!n){
                lastLeaf.lastLeaf = true;
            }
        }

        if(!shCmpPath){
            n = tree[0];
            while(n){
                if(n._isSc){
                    tree[0] = n;
                    break;
                }
                n = n.items;
                n = n && n[0];
            }
        }

        return tree.concat(scts);
    },

    updateNavigator = function (me, tree, shcts){
        me._naviInfo = procNavigationTree(me, tree, shcts);
    };


    /************************Private methods*********************************/

    mstrmojo.ObjectBrowser = mstrmojo.declare(
        // superclass
        mstrmojo.Box,
        // mixins
        null,
        // instance members
        {
            scriptClass: "mstrmojo.ObjectBrowser",

            rootFolderType: null,

            rootFolderID: null,

            //Session id
            sId: null,

            closeOnSelect: true,

            //Browsable object types
            browsableTypes: null,

            closeable: true,

            fishEyeVisible: false, 
            
            searchVisible: true,
            
            currentFolder: null,

            pageCache: [],

            currentPage: -1,

            blockCount: 50,

            canGoUp: true,
            
            folderLinksContextId : null,
            
            showCompletePath : true,
            
            dataProvider: mstrmojo.insert({
                scriptClass: "mstrmojo.ObjectBrowserDataProvider"
            }),
            
            markupMethods: {
                onvisibleChange: function () {
                    this.domNode.style.display = this.visible ? 'block' : 'none';
                }
            },
            
            children: [
            {
                scriptClass: "mstrmojo.HBox",
                alias: 'titleBar',
                cssClass:'mstrmojo-OB-titleTable',
                children: [
                   {   alias: 'title',
                       scriptClass: 'mstrmojo.DropDownButton',
                       cssClass: 'mstrmojo-FormatEditor-DropDownButton', 
                       cssText: 'margin:0px;',
                       popupRef: {
                           scriptClass: "mstrmojo.Popup",
                           contentNodeCssClass: "mstrmojo-OBNavigatorPopup",
                           cssText: "position:relative;",
                           slot: "popupNode",
                           locksHover: true,
                           onOpen : function(){
                               var ob = this.opener.parent.parent,
                                   t = this.tree,
                                   its = ob._naviInfo;
                               if(t.items != its){
                                   t._pup = this;
                                   this.ob = ob;
                                   t.set('items',its);
                               }
                           },
                           children : [
                               {
                                   alias : "tree",
                                   scriptClass : 'mstrmojo.WidgetTree',
                                   itemIdField : "did",
                                   itemFunction: function (item, idx, w) {
                                       var i = mstrmojo.WidgetTree.prototype.itemFunction(item,idx,w);
                                       if(item._open){
                                           i.state = 1;
                                       }
                                       i._ll = !!item.lastLeaf;
                                       i._pup = w._pup;
                                       i.onmousedown = function(evt){
                                           //Only execute the action if we are not the last leaf of the tree
                                           if(!this._ll){
                                               var t = mstrmojo.dom.eventTarget(evt.hWin, evt.e);
                                               if(t == this.domNode || t == this.textNode){
                                                   var p = this._pup;
                                                   p.close();
                                                   browseFolder(p.ob, this.data);
                                               }
                                           }
                                       };
                                       
                                       i.markupMethods.onstateChange = function(){
                                           var s = this.data.items ? this.state : 0;
                                           this.stateNode.className = "mstrmojo-TreeNode-state " + 
                                               ({0: 'closed',1: 'opened',2: 'leaf'}[s] || 'closed');
                                           this.itemsContainerNode.style.display = (s === 1) ? 'block' : 'none';
                                       };
                                       
                                       return i;
                                   }
                               }
                           ]
                       }
                   },
                {
                    alias: 'upButton',
                    scriptClass: "mstrmojo.Button",
                    cssClass: 'mstrmojo-OBListItemIcon up',
                    title: mstrmojo.desc(1152,"Up one level"),  
                    onclick: function () {
                        this.parent.parent.goUp();
                    },
                    bindings: {
                        enabled: 'this.parent.parent.canGoUp'
                    }
                },             
                {
                    alias: 'closebtn',
                    scriptClass: "mstrmojo.Button",
                    iconClass: "mstrmojo-OBCloseButton",
                    title: mstrmojo.desc(2102, "Close"),
                    bindings:{
                        visible: "this.parent.parent.closeable"
                    },
                    onclick: function(){
                        this.parent.parent.close();
                    }
                }]
            },
            {
                alias: 'fishEye', 
                scriptClass : "mstrmojo.FishEyeContainer",
                cssText:'width:100%',
                bindings:{
                    visible: "this.parent.fishEyeVisible"
                }                
            },            
            {
                alias: 'searchUpBar',
                scriptClass: "mstrmojo.HBox",
                children: [
                //Search Box
                {
                    alias: 'obSearchBox',
                    scriptClass: "mstrmojo.SearchBox2",
                    cssClass: "mstrmojo-charcoalbox mstrmojo-dxsprite",
                    cssText: "margin: 5px 0; ",
                    width: '105px',
                    contentWidget: mstrmojo.all.obList,
                    taskId: 'searchMetadata',
                    searchIncFetch: true,
                    enableMatchCase: false,
                    preFetch: function(){
                        this.objectTypes = (this.parent.parent.browsableTypes) ? this.parent.parent.browsableTypes : this.objectTypes;
                	    this.parent.parent.booklet.set('waiting', true);
                    },
                    postFetch: function(){
                	    this.parent.parent.booklet.set('waiting', false);
                    }
                }],
                bindings:{
                    visible: "this.parent.searchVisible"
                }     
            },
            {
                scriptClass: "mstrmojo.Booklet",
                cssText:"width:100%;background-color:white;",
                alias: 'booklet'
            },

            //Incremental Fetch
            {
                alias: "obIncFetch",
                scriptClass: "mstrmojo.IncFetch",

                height: '17px',
                cssText: "height:0px;overflow:hidden;",
                visible: false,
                
                //required to support animation
                np: 0,
                //number of pages
                cp: 0,
                //current page
                ds: { //descriptors
                    f: mstrmojo.desc(4046), // "First"
                    p: mstrmojo.desc(1058), // "Previous"
                    n: mstrmojo.desc(1059), // "Next"
                    l: mstrmojo.desc(4049), // "Last"
                    pgs: mstrmojo.desc(5972), // "## of ### pages"
                    gt: mstrmojo.desc(5878), // "Go to:"
                    v: mstrmojo.desc(6079) // "This field should be # between ## and ###."
                },
                onvisibleChange: function (evt) {
                    //animate the show/hide
                    var h = parseInt(this.height, 10),
                        //widget height
                    show = this.np > 1,
                        //flag to show/hide incFetch
                    props = { //set animation properties
                            target: this.domNode,
                            props: {
                                height: {
                                    start: (show ? 0 : h),
                                    stop: (show ? h : 0),
                                    suffix: 'px'
                                }
                            },
                            onEnd: function () {
                                //restore
                                if (show) {
                                    this.target.style.overflow = 'visible';
                                }
                            }

                        },
                        fx = new mstrmojo.fx.AnimateProp(props); //Animation instance
                    this.domNode.style.overflow = 'hidden';
                    fx.play();
                },
                
                //listen incremental fetch change event
                onifsChange: function (evt) {
                    var old_np = this.np;

                    mstrmojo.hash.copy(evt.value, this);
       
                    if (this.np > 1) {
                    	 //remove current child elements to avoid showing multiple incFetch bars
                        this.children = null;
                        
                        //re-render
                        this.refresh();
                    }

                    //animate IncFetch's visibility by sliding it in/out
                    if (old_np <= 1 && this.np > 1 || old_np > 1 && this.np <= 1 || old_np === 0 && this.np > 0) {
                        this.set('visible', this.np > 1);
                    }
                    this.cssText = "";
                }
            }

            ],


            /************************Instance methods*********************************/
            
            postBuildRendering: function () {
                if (this._super) {
                    this._super();
                }
                if (this.fishEye && this.fishEyeVisible) {
                    this.fishEye.attachEventListener("selectedIndexChange", this.id, "onFishEyeChange");
                }
                var sb = this.searchUpBar;
                if (sb && sb.obSearchBox && this.searchVisible) {
                    this.obSearchBox = this.searchUpBar.obSearchBox;
                    this.obSearchBox.attachEventListener("itemsChange", this.id, "onSearchItemsChange");

                    var contentWidget = this.obSearchBox.contentWidget || this.obSearchBox;
                    contentWidget.attachEventListener("ifsChange", this.id, function (evt) {
                        this.obIncFetch.set('ifs', evt.value);
                    });
                }

                // Attach event handler to update IncFetch GUI and fetch new page of data.
                if (this.obIncFetch) {
                    var incFetch = this.obIncFetch;
                    incFetch.attachEventListener('fetch', this.id, function (evt) {
                        //'this' is the searchBox instance
                        incFetch.cp = evt.v;
                        incFetch.children = null;
                        incFetch.refresh();

                        //load selected page
                        refresh(this, (evt.v - 1) * this.blockCount + 1, this.searchVisible ? this.obSearchBox.inputNode.value : '', 1);
                    });
                }

            },

            onSearchItemsChange: function (evt) {
                var items = evt.value,
                    currPage = this.pageCache[this.currentPage]._w;
                if(!items || items.length == 0){
                    items = [{did:'empty',n:'('+mstrmojo.desc(2210)+')',t:'e'}]; // "(empty)"
                }
                currPage.set('items', items);
            },

            /*
             * This method will be called from a list on the booklet and will navigate
             * to the next page turning the booklet forward.
             * */
            navigate: function (evt) {
                var item = evt && evt.src.selectedItem;
                
                if(item && item.did == 'empty'){
                    return;
                }
                
                if (!item || item[MTP] == 8) { // renamed "tp" to "t"
                    browseFolder(this, item);
                } else if (item) {
                    this.select(item);
                }
            },

            onFishEyeChange: function (evt) {
                this.goToPage(evt.value);
            },

            /*
             * To go to any of the widgets on the page cache use this method, using the
             * index of the page
             * */
            goToPage: function (index) {
                //Check if we are getting a valid index, in bounds and different from current page
                if (index < this.pageCache.length && index != this.currentPage) {
                    //Forward: true
                    var direction = index > this.currentPage,
                        info = this.pageCache[index];
                    this.set('currentPage', index);
                    this.booklet.turn(info._w, direction);
                    this.set('currentFolder', info);
                    checkCanGoUp(this, info);
                }
            },

            oncurrentPageChange: function (evt) {
                if (this.fishEye) {
                    this.fishEye.setSelectedIndex(evt.value);
                }

                var pageCache = this.pageCache[this.currentPage];

                this.titleBar.title.set('text', pageCache.n);

                if (this.searchVisible && this.obSearchBox) {
                    this.obSearchBox.set('rootCacheItems', pageCache.items || []);
                    this.obSearchBox.set('totalSize', pageCache.sz);
                    this.obSearchBox.set('rootID', pageCache.did);
                    this.obSearchBox.clearSearch();
                }

                if (this.obIncFetch) {
                    //update IncFetch setting
                    this.obIncFetch.set('ifs', {
                        np: Math.floor(pageCache.sz / pageCache.bc) + ((pageCache.sz % pageCache.bc > 0) ? 1 : 0),
                        //total pages 
                        cp: Math.floor(pageCache.bb / pageCache.bc) + ((pageCache.bb % pageCache.bc > 0) ? 1 : 0) //current page
                    });
                }
            },

            cacheChange: function () {
                if (this.fishEye && this.fishEyeVisible) {
                    this.fishEye.setItems(this.pageCache);
                }
            },

            browse: function (params) {
                for (var x in params) {
                    this[x] = params[x];
                }
                if(this.searchVisible && this.obSearchBox){
                    this.obSearchBox.clear();
                }
                clearCache(this);
                this.navigate();
            },

            close: function () {
                var ctx = this.ctx || this,
                    cb = ctx.onCloseCB;
                if (cb) {
                        cb[0][cb[1]]();
                    }
                ctx.set('visible', false);
            },

            select: function (item) {
                var cb = this.onSelectCB;
                if (cb) {
                    cb[0][cb[1]](item);
                }
                if (this.closeOnSelect) {
                    this.close();
                }
            },

            goUp: function () {
                if (this.canGoUp) {
                    browseFolder(this, {
                        did: this.currentFolder.pf
                    });
                }
            },
            
            oncurrentFolderChange : function(evt){
                var cf = evt.value;
                updateNavigator(this, cf.anc.items, cf.sc);
            },


            refreshContent: function (blockBegin) {
                refresh(this, blockBegin);
            }, 
            
            //hook for the callback on failure
            onError : null,
            
            onheightChange : function(){
                var arr = ["titleBar", "fishEye", "searchUpBar", "obIncFetch"],
                    h = 0,
                    bookletHeight = 0;
                for(var i in arr){
                    h += parseInt(this[arr[i]].domNode.offsetHeight);
                }
                bookletHeight = parseInt(this.height) - h;
                this.booklet.set('height', bookletHeight + "px");
            }

        });

})();