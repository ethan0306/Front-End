(function() {

    mstrmojo.requiresCls(
            "mstrmojo.dom",
            "mstrmojo.css",
            "mstrmojo.fx",
            "mstrmojo.xhr",
            "mstrmojo.CheckBox",
            "mstrmojo.TextBox",
            "mstrmojo._HasSuggestion"
    );
    mstrmojo.requiresDescs(517,518,2105,2106,2528);
    
    var $C = mstrmojo.css;

    var SUPPORTED_TYPE = '3072,1024,1027,1028,47,257,3585,3586,3587'; //Supported Object Types 
    var _Duration = 300; //default duration for animation
    
    /**
     * <p> Animation effect of sliding in/out of a widget</p>
     * 
     * @param {DOMNode} target DOMNode to animate 
     * @param {String} prop CSS property name ('height', 'top' etc)
     * @param {Integer} start Value to start animation
     * @param {Integer} stop  Value to stop animation
     * @param {Function} onEnd Callback to run when animation ends
     * @param {String} ease Name of the ease type
     * @param {Object} extrProps Extra properties to set to the animation instance
     */
    function slideProp(w, target, prop, start, stop, onEnd, ease, extraProps) {

        // set animation properties
        var props = {
                duration: w && w.duration || _Duration,
                target : target,
                onEnd : function() {
                    if (onEnd) {
                        onEnd();
                    }
                },
                props: {}
            };
        
        props.props[prop] = {
                ease : ease,
                start : parseInt(start, 10),
                stop : parseInt(stop, 10),
                suffix : 'px'
            };//targetProps;

        // copy in other widget specific animation properties
        props = mstrmojo.hash.copy(extraProps, props);

        // Animation instance
        var fx = w && w.fx || new mstrmojo.fx.AnimateProp(props);
           
        if (w) {
            w.fx = w.fx || fx;
        }
        
        //update props to the instance
        mstrmojo.hash.copy(props, fx);

        
        fx.play();
        
//        console.log('--- ')
//        console.trace()
    }
    
    
    /**
     * Object path returned is a xml string, convert it to breadcrumb style
     */
    var pathParser = function(pathXmlString) {
        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(pathXmlString, "text/xml");
        }
        else // Internet Explorer
        {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(pathXmlString);
        } 

        var pathNode = xmlDoc.getElementsByTagName("path")[0],
            childNodes = pathNode.childNodes,
            path = '';
        if (childNodes) {
            for (var i = 0, len = childNodes.length; i < len; i ++) {
                var vNode = childNodes[i].childNodes && childNodes[i].childNodes[0];
                if (vNode) {
                    path += vNode.nodeValue + (i < len - 1 ? '> ' : '');
                }
            }
        }
        return path;
    };
    
    //indices of all supported options of object types as selected by default
    var _allIndices = {'0': true, '1': true, '2': true, '3': true, '4': true};
    
    
    /**
     * A Search Box Widget with Suggestion in Popup display.
     * 
     * @class
     * @extends mstrmojo.Widget
     */
    mstrmojo.ReportQuickSearchBox = mstrmojo.declare(
        // superclass
        mstrmojo.TextBox,
        
        // mixins
        [mstrmojo._HasSuggestion, mstrmojo._HasChildren], 
        
        // mstrmojo.ReportQuickSearchBox.prototype
        {
               markupString: '<div id={@id} class="mstrmojo-SearchBox2-Wrapper {@cssClass}" style="display:inline-block; Xoverflow:hidden;{@cssText};">' +
                                  '<div class="mstrmojo-SearchBox2" mstrAttach:click >' + 
                                      '<span class="mstrmojo-SearchBox2-search {@shortCssClass}" id="{@id}sbSearch"></span>' +
                                      '<span class="mstrmojo-SearchBox2-down" id="{@id}sbDown" style="{@cssTextShowOptions}"></span>' +
                                      '<input class="mstrmojo-SearchBox2-input" type="text" autocomplete="off" id="{@id}sbInput" style="width:{@width};"' + 
                                          ' mstrAttach:focus,keydown,keyup,blur,paste,cut ' +      
                                      '/>' +
                                      '<span class="mstrmojo-SearchBox2-right" style="width:{@rWidth};">' +
                                          '<span class="mstrmojo-SearchBox2-clear" id="{@id}sbClear" ></span>' +
                                          '<span class="mstrmojo-SearchBox2-spinner" id="{@id}sbSpinner"></span>' + 
                                      '</span>' +
                                  '</div>' +
                                  '<div class="mstrmojo-SearchBox2-options reportQuickSearch" style="overflow:hidden; white-space:nowrap;text-align:left; ">' +
                                      '<div style="{@cssTextShowMC}">' +
                                          '<input id="{@id}sbMatchCase" type="checkbox"' +
                                              ' mstrAttach:click ' +
                                          '/>' +
                                          '<label for="{@id}sbMatchCase">Match Case</label>' +
                                      '</div>' + 
                                  '</div>' +
                                '</div>',
                            
                 markupSlots: {
                          inputNode: function(){return this.domNode.firstChild.firstChild.nextSibling.nextSibling;},
                          searchNode: function(){return this.domNode.firstChild.firstChild;},
                          downNode: function(){return this.domNode.firstChild.firstChild.nextSibling;},
                          spinnerNode: function(){return this.domNode.firstChild.lastChild.lastChild;},
                          clearNode: function(){return this.domNode.firstChild.lastChild.firstChild;},    
                          optionsNode: function(){return this.domNode.lastChild;},
                          matchCaseNode: function(){return this.domNode.lastChild.firstChild.firstChild;},
                          containerNode: function(){return this.domNode;}
                },
                
                cssDisplay: 'inline-block', //set 'display style' for TextBox
                
                //Objects Types List 
                objectsListWidget:
                    {
                        scriptClass: 'mstrmojo.List',
                        cssClass: 'mstrmojo-ReportQuickSearch-objects-list',
                        alias: 'objectsList',
                        slot: 'optionsNode',
                        multiSelect: true,
                        selectionPolicy: 'toggle',
                        selectedIndices: _allIndices, //{'0': true, '1': true, '2': true, '3': true, '4': true},
                        items: [{n: mstrmojo.desc(518,'Attribute'), t: 12, st: '3072'},
                                {n: mstrmojo.desc(517,'Metric'), t: 4, st: '1024,1027,1028'},
                                {n: mstrmojo.desc(2106,'Consolidation'), t: 47},
                                {n: mstrmojo.desc(2105,'Custom Group'), t: 1, st: '257', st_icon: 257},
                                {n: mstrmojo.desc(2528,'Hierarchy'), t: 14, st: '3585,3586,3587'}
                                ],
                        itemMarkupFunction: function(item, idx) {
                            return '<div class="item"><div><span class="mstrmojo-ListIcon  t' + item.t + (item.st_icon ? ' st' + item.st_icon: '') + '"></span>' + item.n + '</div></div>';
                        },
                        onchange: function(){
                            if (!this.domNode) return;
                            var ot = [],
                                si = mstrmojo.hash.isEmpty(this.selectedIndices) ? _allIndices : this.selectedIndices;
                            for (var i in si) {
                                var itm = this.items[i],
                                    st = itm.st;
                                if (st) {
                                    ot = ot.concat(st.split(','));
                                } else {
                                    ot.push(itm.t);
                                }
                            }
                            this.parent.objectType = ot.toString();;
                            
                            //refresh search now?
                            //this.parent.searchNode.click();
                        }
                },
                preBuildRendering: function() {
                    if (this._super) this._super();

                    this.cssTextShowMC = this.enableMatchCase ? '' : 'display: none;';
                    this.cssTextShowOptions = this.enableOptions ? '' : 'display: none;';
                    this.shortCssClass = this.enableOptions ? '' : 'short';
                    
                    
                    this.markupMethods = mstrmojo.hash.copy(mstrmojo.hash.copy(this.markupMethods));
                    this.markupMethods.oncssClassChange = function(){};
//                    this.markupMethods.onvisibleChange = function(){
//                        this.domNode.style.visibility = this.visible ? 'visible' : 'hidden';
//                    };
                    
                    
                    var me = this;
                    
                    //suggestion popup
                    this.suggestionPopup.cssClass = 'mstrmojo-ReportQuickSearch-Suggest';
                    
                    //scroller buttons over popup
                    /**
                     * @param props JSON object to add additional widget properties
                     * @param props.alias 'down' or 'up'
                     * @param props.css 'down' or 'up'
                     * @param props.step 20 for 'down' button, -20 for 'up' button
                     */
                    var createScrollButton = function scrollBtn(props) { 
                        return ( {
                            scriptClass: 'mstrmojo.Label',
                            markupString: '<div id="{@id}" class="mstrmojo-Label scroller {@cssClass}" style="{@cssText}" mstrAttach:mouseover,mouseout></div>',
                            alias: props.alias,
                            text: props.label,
                            cssClass: props.css,
                            step: props.step,
                            scrollable: true,
                            onmouseover: function() {
                                var w = this,
                                    pop = this.parent,
                                    scrollNode = pop.containerNode,
                                    list = pop.list,
                                    step = w.step,
                                    alias = w.alias,
                                    isFB = alias == 'down'; //is fetch button
                                
                                  
                                //use timeout to scroll and fetch nextblock if necessary
                                this.tmr = window.setInterval(function() {
                                    if (!isFB || isFB && me.spinnerStatus == false) {
                                        //scroll results
                                        var old = scrollNode.scrollTop;
                                        
                                        scrollNode.scrollTop += step;
                                        
                                        if (old == scrollNode.scrollTop) {
                                            return;
                                        }
                                    }
                                    else {
                                        return;
                                    }
                                    
                                    //update scroller buttons status
                                    me.blockBegin = (me._last_hit && me._last_hit.items || me.suggestionItems || []).length;
                                    var hasMore = ((me.blockBegin + me.blockCount) < me.sz);
                                    var itemHeight = 20,
                                        mh = 5 * itemHeight, //margin height - at the moment 5 items is not visible yet, and we should start fetch next block
                                        sh = 10 * itemHeight, //scrollNode height
                                        rh = me.suggestionItems.length * itemHeight - scrollNode.scrollTop - sh;  //remaing items height
                                    
                                    w.parent.up.set('scrollable', scrollNode.scrollTop > 0);
                                    w.parent.down.set('scrollable', hasMore || rh > 0);
                                  
                                    
                                    //incremental fetch next block
                                    if (isFB && me.spinnerStatus == false) {
                                        var start = rh < mh;
                                        
                                        if (start && hasMore) {
                                            me.blockBegin += me.blockCount;
                                            me._last_hit = null;
                                            me._request_pattern = null;
                                            me.onvalueChange();
                                        }
                                    }
                                    
                                }, 100);
                            },
                            onmouseout: function() {
                                if (this.tmr) {
                                    clearInterval(this.tmr);
                                }
                            },
                            bindings: {
                                visible: function() {
                                        return this.parent.opener.suggestionItems.length > me.viewableCount;
                                    },
                                infLoading: function() {
                                        return this.parent.opener.spinnerStatus;
                                    }
                            },
                            onscrollableChange: function(evt) {
                                if (this.domNode) {
                                    this.domNode.className = this.domNode.className.replace(/ disabled/g,'') + (this.scrollable? '' : ' disabled');
                                }
                            },
                            oninfLoadingChange: function(evt) {
                                //Incremental Fetch Loading icon
                                if (this.domNode && this.alias == 'down') {
                                    this.domNode.className = this.domNode.className.replace(/ loading/g,'') + (this.infLoading ? ' loading' : '');
                                }
                            },
                            postBuildRendering: function() {
                                if (this._super) this._super();
                                
                                //update scroll button status
                                var up = this.parent.up,
                                    scrollNode = this.parent.containerNode;
                                window.setTimeout(function(){up.set('scrollable', scrollNode.scrollTop > 0);}, 200);
                            }
                        });
                    };
                    
                    this.suggestionPopup.children.push(
                            createScrollButton({alias:'up', label: '', css: 'up', step: -20}),
                            createScrollButton({alias:'down', label: '', css: 'down', step: 20})
                    );
                },
                    
                /**
                 * Flag to use new search engine
                 */
                quicksearch: false,
                searchDelay: 300,
                
                enableMatchCase: false,
                enableOptions: false,
                
                /**
                 * Flag to indicate whether user input will trigger requesting Search Results in the Suggestions Popup
                 * @param {String} A mojo scriptclass name used to build Search Results 
                 * @default null
                 */
               targetWidget: null,
               targetPlaceHolder: null,
               

               /**
                * override the default from the mixin
                */
              suggestCount: 1000,
              REQUEST_THRESHOLD: 1000,
              
              /**
               * Number of items in each task request
               */
              blockCount: 20,
              
              /**
               * Number of items visible in the results popup
               */
              viewableCount: 10,
              
              /**
               * Show up / down arrows if results is more than displayed items
               */
              showScrollArrow: true,
              
              
               /**
                * List of object types (separted by comma) to search. 
                * By default it is null, and all objects types will be searched.
                * @type {String}
                * @default '4,12,47,257' //Attribute, Metric,Consolidation,Custom Group
                */
               objectType: SUPPORTED_TYPE,
               ALL_TYPES: SUPPORTED_TYPE,
               
               hasUserInput: false,
               value: '',
               emptyText: 'search',
               
               /**
                * Width of the &gt;INPUT&gt; tag
                * By default it is 20px wide, and extend to 160px when receiving user input
                * 
                * @type {String}
                * @default 32px
                */
               width: '35px',
               maxWidth: '130px',
               
               
               expanded: false,
               
               onfocus: function() {
                    if (!this.hasUserInput && !this.expanded) 
                    {
                        if (this.fx && this.fx.isPlaying) this.fx.cancel();
                        slideProp(this, this.inputNode, 'width', parseInt(this.width, 10), parseInt(this.maxWidth, 10));
                        this.expanded = true;
                    }
               },
               blur: function(evt) {
                   //check if there is user input
                   if (!this.hasUserInput) {

                       var start = parseInt(this.inputNode.value == this.emptyText ? this.width: this.maxWidth, 10);
                       slideProp(this, this.inputNode, 'width', start, parseInt(this.width, 10));
                       
                       this.expanded = false;
                   }
               },
                
                /**
                 * <p>Handle click on each SearchBox component</p>
                 * 
                 * @param {DOMEvent} evt
                 * @private
                 */
                onclick: function(evt) {
                    var hWin = evt.hWin,
                        e = evt.e || hWin.event,
                        tgt = e.target || e.srcElement,
                        id = tgt && tgt.id;
                    
                    //local function to update selected object types 
                    var me = this;
                    var updateObjectType = function(node) {
                        var v = node.value,
                            add = node.checked,
                            ots = me.objectType == '' ? [] : me.objectType.split(',');
    
                        if (add) {
                            //me.objectType += (me.objectType.length > 0 ? ',' : '' ) + v;
                            ots.push(v);
                        } else {
                            //me.objectType = me.objectType.replace(new RegExp('(^' + v +',?)|(,?' + v +')', 'g'), '');
                            ots = mstr.$A.removeItems(ots, [v]);
                        }
                        
                        //sort
                        me.objectType = ots.sort().toString();
                    };
                    
                    switch (id.replace(this.id, '')) {
                        
                        default:
//                        case 'sbInput':
                            //hide the 'match case' popup if visible
                            if (this.enableOptions) {
                                this.optionsVisible = !this.optionsVisible
                                
                                this.optionsNode.style.display = 'none';
                                
                                //if options changed, update search results
                                if (this.oldObjectType != this.objectType) {
                                    var v = this.value;
                                    this.value = null;
                                    this.set('value', v);
                                }
                                this.oldObjectType = this.objectType;
                            }
                            mstrmojo.dom.preventDefault(hWin, e);
                            mstrmojo.dom.stopPropogation(hWin, e);
                            
                            break;
                        case 'sbDown': //dropdown arrow to toggle 'Match Case' popup
                            if (this.enableOptions) {
                                //render supported objects list into options node
                                if (!this.objectsList) {
                                    this.addChildren(this.objectsListWidget);
                                    this.renderChildren();
                                }
                            
                                //hide popup
                                this.hideSuggestion();
                                
                                this.oldObjectType = this.objectType.split(',').sort().toString();
                                
                                var h = (this.objectsList.items.length + 1) * 20 - (this.enableMatchCase ? 0 : 20);
                                var s = this.optionsNode.style;
                                var show = (this.optionsVisible = !this.optionsVisible);
                                var start = show ? 0: h;
                                var stop = show ? h : 0;
                                
                                if (show) {
                                    s.height = '1px';
                                    //s.overflow = 'hidden';
                                    s.display = 'block' ;
                                }
                                slideProp(this, this.optionsNode, 'height', start, stop, 
                                        function() {
                                            s.display = show ? 'block' : 'none';
                                        }
                                        ,null,{duration: 200}
                                    );
                            }
                            break;
                            
                        case 'sbSearch': //search icon
                            if (mstrmojo.string.trim(this.value).length > 0) {
                                
                                this._last_hit = null;
                                this._request_pattern = null
                                this.hideSuggestion();
                                
                                this.showSuggestion(this.value);
                            }
                            break;
//                            
//                        case 'sbMatchCase': //Match Case checkbox
//                            this.set('matchCase', this.optionNode.checked);
//                            break;
                            
                        case 'sbClear': //clear icon
                            this.clearSearch();
                            break;
//                            
//                        case 'sbSpinner': //spinner icon
//                            //TODO: should we support cancel search when clicking on this icon?
//                            break;
                    }
                    
                },
                
                clearSearch: function(noBlur){
                    this.inputNode.value = '';
                    this.value = '';
                    this.hasUserInput = false;
                    this.clearStatus = false;
                    this.blockBegin = 1;
                    
                    //hide popup
                    this.hideSuggestion();
                    
                    //hide possible path
                    this.hidePath();
                    
                    //restore to initial status
                    if (!noBlur) {
                        this.blur();
                        this.inputNode.blur(); //DO NOT CHange
                    }
                    
                    //hide icon
                    $C.removeClass(this.clearNode, ['show']);                   
                },
                

                clearStatus: false,
                onclearStatusChange: function(evt) {
                    //show 'clear' icon
                    if (this.clearNode) {
                        $C.toggleClass(this.clearNode, ['show'], evt.value);
                    }
                },
                
                spinnerStatus: false,
                
                onspinnerStatusChange: function(evt) {
                  //show 'clear' icon
                    if (this.spinnerNode) {
                        $C.toggleClass(this.spinnerNode, ['show'], evt.value);
                    }
                },
                
               onvalueChange: function prevalueChange(evt){
                    //reset Popup scrollTop when there is user input
                    this.append = true; //for inc fetch
                    if (evt) {
                        var pop = this.suggestionPopup,
                            scrollNode = pop && pop.containerNode;
                        if (scrollNode) {
                            scrollNode.scrollTop = 0;
                        }
                        //there is key event, should replace popup instead of appending
                        this.append = false;
                        
                        //reset blockBegin to 1
                        this.blockBegin = 1;
                    } 
                    
                    this.hasUserInput = mstrmojo.string.trim(this.value).length > 0;
                    
                    this.set('clearStatus', this.value.length > 0);
                    
                    if (mstrmojo.string.trim(this.value).length == 0) {
                        this.hideSuggestion();
                    } else {
                      
                        //clear previous timeout setting
                        if (this.tmr2) {
                            clearTimeout(this.tmr2);
                        }
                        
                        //use timeout to send request to avoid sending request for each single key event
                        var me = this;
                        this.tmr2 = window.setTimeout(function() {
                            me.showSuggestion(me.value);
                        }, this.searchDelay);
                    }
               },
               
               onArrowUp: function onArrowUp(evt){
                   this.preHighlight();
               },
               
               onArrowDown: function onArrowDown(evt){
                   this.nextHighlight();
               },
               
               //prevent firing form submit in the report template
               onkeydown: function(evt) {
                   var hWin = evt.hWin,
                       e = evt.e || hWin.event;
               
                   if (e.keyCode == 13) {
                       mstrmojo.dom.preventDefault(hWin, e);
                       mstrmojo.dom.stopPropogation(hWin, e);
                   }
               },
               
               onEnter: function onEnter(evt){
                   this.onSuggestionItemSelect(this.getSelected());
                   this.hideSuggestion();
                   
                   var hWin = evt.hWin,
                       e = evt.e || hWin.event;
                   mstrmojo.dom.preventDefault(hWin, e);
                   mstrmojo.dom.stopPropogation(hWin, e);
               },
               
               getCandidatesThroughTaskCall: function getCandidatesThroughTaskCall(params, callbacks){
                   
                   this.set('spinnerStatus', true);
                   
                   var me = this;

                   var taskParams = {
                               taskId: 'searchMetadata',
//                               styleName: 'WidgetFolderStyle',
                               styleName: 'MojoFolderStyle',
                               searchPattern : (this.searchPattern || params.pattern), //Each result item should begin with user input
                               nameWildcards : this.quicksearch ? 16 : 1, //4 - Begin With; 1 - Contains; 16 - Contains any
                               blockBegin: this.blockBegin || 1,
                               blockCount: this.blockCount || params.blockCount,
                               maxObjects: this.blockCount || params.blockCount || microstrategy.objectsBlockCount, //if we could read second block from cache, then we should use microstrategy.objectsBlockCount
                               recursive: 1,
                               objectType: this.objectType || SUPPORTED_TYPE,
                               XincludeAncestorInfo: true,
                               quicksearch:  this.quicksearch,
                               sortKey: this.quicksearch ? -1: 6  //new search uses no Web sort {EnumWebObjectSort}.
                            };
                  
                       
                       callbacks = mstrmojo.hash.copy(callbacks, 
                               {
                                   complete: function() { me.set('spinnerStatus', false); }
                               }
                       );
                       mstrmojo.xhr.request('POST', mstrConfig.taskURL, callbacks, taskParams, undefined);
               },
               /**
                * Return all suggestion based on the pattern (which is what user types). The default implementation is to return the
                * first n candidates that meet pattern (n = suggestCount). 
                * 
                * This method shall be overrode if this default implementation is not desirable for specific scenario. 
                */
               getSuggestion: function(t){
                   var lh = this._last_hit,
                       len =0,
                       fcs = [];                    
//                   if (lh) {
//                       //add items from last hit
//                       {
//                           var p = lh && lh.pattern;
//                           if(lh && p && (t.indexOf(p) > -1)){
//                               var lhc = this.filterCandidates(lh.items, t, this.REQUEST_THRESHOLD),
//                                   llen = lhc && lhc.length,
//                                   A = mstrmojo.array,
//                                   ifd = this.itemField,
//                                   i;
//                               
//                               for (i=0; i < llen; i++){
//                                   if (A.find(fcs, ifd, lhc[i][ifd]) === -1){
//                                       fcs.push(lhc[i]);
//                                   }
//                               }
//                               
//                               len = fcs.length;
//                           }
//                       }
//                   }
                       
                   //no candidates, make a request for them, and return null
                   if (len < this.blockCount) {
                       this._request_pattern = null; //reset to avoid skipping necessary request
                       this.requestCandidates(t);
                   }
                   
                   return fcs;
               },
               filterCandidates: function filterCandidates(its, t, max){
                   return its || [];
                   max = max || this.suggestCount;
                   t = mstrmojo.string.regEscape(t);
                   t = t.replace(/^"(.*)"$/,'$1'); //remove potential user input double quote
                   var tps = this.objectType,
                       itf = this.itemField,
                       f = function(it){
                           //return (new RegExp('\\s' + t + '|^' + t,'i')).test(it[itf]) && (new RegExp('(^' + it.t +',?)|(,?' + it.t +')').test(tps));
                           return (new RegExp(t,'i')).test(it[itf]) && (new RegExp('(^' + it.t +',?)|(,?' + it.t +')').test(tps));
                       },
                       fcs = mstrmojo.array.filter(its, f, {max:max});
                   return fcs;
               },
               updateSuggestion: function updateSuggestion(its){
                   var len = its && its.length;
                   if(this.suggestionShown){//just update the suggestion items
                       //this.set('suggestionItems', its);
                       //append to existing items
                       its = this.append ? (this.suggestionItems || []).concat(its) : its;
                       this.set('suggestionItems', its);
                   } else {
                       this.set('suggestionItems', its);
                       this.openPopup('suggestionPopup',this.getSuggestionPos());
                       this.suggestionShown = true;
                   }
                   if (its.length == 0) {
                       this.hideSuggestion();
                   }
               },
               onSuggestionItemSelect: function onSuggestionItemSelect(it){
                   if (!it || it.tp == -99) return false;
                   
                   //collect item info
                   var idx = this.suggestionPopup.list.selectedIndex,
                       elItem = this.suggestionPopup.list.itemsContainerNode.childNodes[idx],
                       elSpan = elItem && elItem.firstChild && elItem.firstChild.lastChild;

                   //Callback to be set to this searchbox widget instance
                   if (this.itemSelectCallback) {
                       //remove event handlers
                       elSpan.removeAttribute('onmouseout');
                       elSpan.removeAttribute('onmouseover');
                       elSpan.title = elSpan.getAttribute('ds');
                       
                       this.itemSelectCallback(elSpan/*, this.suggestionPopup.list.items[idx].dssforms*/);
                   }
                   
                   this.cancelPath = true;
                   this.hidePath();
               },               
               renderLayeredIcon: function(item) {
                   var t = item.t,
                       st = item.st,
                       tCssClass = ' t' + t,     //css class for Object Type level
                       stCssClass = st ? ' st' + st : '',     //css class for Object subtype
                       iscCssClass = item.isc ? 'class="sc"': '';  //css class for a shortcut object
                   

                   var icon = {4: 'm', 12: 'a', 1: 'cg', 47: 'co'}[t];
                   var el = '<span class="mstrIcon-lv layered mstrIcon-lv-' + icon /*item.icon*/ + '" style="vertical-align:middle;">' +
                               '<span ' + iscCssClass + '></span>' +
                           '</span>';
                   return el;
               },
               
               itemRenderer: function(data, idx, w) {
                   
                   //MojoFolderStyle
                   //Mapping data props to html node props
                   var map = {
                           n: 'ds',
                           did: 'oid',
                           st: 'ost',
                           t: 'oty',
                           acg: 'acg',
                           isc: 'isc'
                   };
                   
                   //build attributes for each item
                   atts = '';
                   for (var i in map) {
                       //atts += ' ' + i + '="' + data[i] + '"';
                       if (map[i] && data[i]) {
                           atts += map[i] + '="' + data[i] + '" ';
                       }
                   }
                   
                   //build object path
                   var path = '',
                       anc = data.anc,
                       items = anc && anc.items || [];
                   for (var i = 0, len = items.length; i < len; i ++) {
                       path += items[i].n + ((len > 1) && (i < len - 2)? ' > ' : '');
                   }
                       
                   return '<div class="mstrmojo-List-item" idx="' + idx + '" onmouseover="mstrmojo.all[\'' + this.id + '\'].suggestionPopup.list.singleSelect(' + idx +' )">' +
                               this.renderLayeredIcon(data) +
                               '<span class="mstrmojo-List-text" ' + atts + ' onmouseover="mstrmojo.all[\'' + this.id + '\'].getPath(this)"  titleX="' + path + '">'  + data[w.itemField] + '</span>' +
                          '</div>';
               },
               
               hidePath: function() {
//                   if (this.pathTmr) {
//                       window.clearTimeout(this.pathTmr);
//                   }
                   
                   //this.cancelPath = true;
                   var me = this;
                   var pn = this.pathNode;
                   if (pn && parseInt(pn.style.width,10) > 0) {
                       slideProp(null, pn, 'height', pn.firstChild.offsetHeight, 0, function(){me.cancelPath = false;});
                       slideProp(null, pn, 'width', 200, 0);
                   }
               },
               showPath: function (path, el) {
                   var pathNode = this.pathNode;
                   if (!pathNode) {
                       var pn = mstrmojo.insert({
                           scriptClass: 'mstrmojo.Container',
                           markupString: '<div class="mstrmojo-ReportQuickSearch-pathPopup">' +
                                           '<div class="mstrmojo-ReportQuickSearch-pathContent"></div>' +
                                           '<div class="mstrmojo-ReportQuickSearch-pathTip"></div>' +
                                         '</div>'
                       });
                       pn.render();
                       pathNode = pn.domNode;
                       
                       document.body.appendChild(pathNode);
                       
                       this.pathNode = pathNode;
                   }
                   
                   //show path in animation
                   if (path && !this.cancelPath && this.suggestionShown) {
                       pathNode.className = pathNode.className.replace(/ right/, '');
                       pathNode.firstChild.innerHTML = path;
                       
                       var pos = mstrmojo.dom.position(el.parentNode, true);
                       //console.log('before: x = ' + pos.x + '  y = ' + pos.y + ' pos.w =' + pos.w +  '  t = '  + (pos.y  + pos.h/2 - h/2) + '    this.suggestPop.domNode.offsetTop=' +  this.suggestionPopup.editorNode.style.top+ '    this.suggestPop.domNode.left=' +  this.suggestionPopup.editorNode.style.left)
                       pos.x = pos.x == 0 ? parseInt(this.suggestionPopup.editorNode.style.left, 10) : pos.x;
                       pos.y = pos.y == 0 ? parseInt(this.suggestionPopup.editorNode.style.top + 32, 10) : pos.y;  //32px scroll icon height
                       pos.w = pos.w == 0 ? parseInt(this.suggestionPopup.editorNode.offsetWidth, 10) : pos.w;  //32px scroll icon height
                       //console.log('after: x = ' + pos.x + '  y = ' + pos.y + ' pos.w =' + pos.w +  '  t = '  + (pos.y  + pos.h/2 - h/2) + '    this.suggestPop.domNode.topp=' +  this.suggestionPopup.editorNode.style.top+ '    this.suggestPop.domNode.style.left=' +  this.suggestionPopup.editorNode.style.left)

                       var h = pathNode.firstChild.scrollHeight,
                           w = (pathNode.firstChild.scrollWidth + 3 )|| 245, //3px for shadow
                           cw = document.body.clientWidth,
                           sl = document.body.scrollLeft,
                           adjustment = 20,
                           l = pos.x + pos.w ; //+ adjustment;
                       
                       if (l + w > cw) {
                           l = pos.x - w - adjustment;
                           pathNode.className += ' right';
                       }
                       
                       pathNode.style.left = l + 'px';
                       pathNode.style.top = pos.y  + pos.h/2 - h/2 + 'px';
                       
                       slideProp(null, pathNode, 'height', 0, h + 5, function() {pathNode.style.height = 'auto';}); //5px adjustment for shadow
                       slideProp(null, pathNode, 'width', 0, w + adjustment);

                       this.cancelPath = false;
                   }
                   
               },
               getPath: function(el) {
                   var me = this;
                   
                   if(this.pathTmr) window.clearTimeout(this.pathTmr);
                   
                   var ttl = el.ttl || el.getAttribute('ttl');
                   this.pathTmr = window.setTimeout( function() {
                       me.hidePath();
                       me.showPath(ttl, el);
                       
                       if (ttl) {
                           return; //already have path
                       }

                       //request path info
                           //el.parentNode.className += ' loading';
                           
                           me.pathNode.firstChild.innerHTML = '<div class="loading"></div>';
                           
                           mstrmojo.xhr.request('POST', mstrConfig.taskURL, 
                                   { //callbacks
                               success: function(res) {
                               //set path to 'title'
                               //el.ttl = res.toString().replace(/\r?\n?\s*/g,'').replace(/^.*<path><folder>/g,'').replace(/<\/folder><folder>/g, ' > ').replace(/<\/folder><\/path><\/oi>/g, '') || 'N/A';
                               el.ttl = pathParser(res.toString()) || 'N/A';
                               
                               //el.parentNode.className = el.parentNode.className.replace(/ loading/,'');
                               
                               me.showPath(el.ttl, el);
                           }
                                   },
                                   {//taskParams
                                       taskId: 'getObjectDetails',  //need a task to get only path info
                                       objectID: el.getAttribute('oid'),
                                       objectType: el.getAttribute('oty'),
                                       sessionState: mstrApp.sessionState
                                   },
                                   undefined);
                   }, 200);
                   
               },
               
               getSearchPattern: function getSearchPattern(){
                   return this.value;
               },
               
               getSuggestionPos: function getSuggestionPos(){
                   var p = mstrmojo.dom.position(this.domNode,true);
                   this._sugPos = {left:Math.round(p.x) + 'px', top: Math.round(p.y + p.h - 1) + 'px', zIndex: 108};
                   return this._sugPos;
               }
        });
    

//    
//create ReportQuickSearchBox wrapper and SearchBox placeholder
mstrmojo.ReportQuickSearchBoxPopup = mstrmojo.declare(
    mstrmojo.Container,
    null,
    {
        scriptClass: 'mstrmojo.ReportQuickSearchBoxPopup',
        markupString: '<div id={@id} class="mstrReportQuickSearchBoxWrapper {@cssClass}" mstrAttach:mouseover>' +
                            '<div class="mstrIcon-btn mstrIcon-btnClose" mstrAttach:click></div>' +
                            '<div ty="qs"></div>' +   //dummy searchbox 
                      '</div>',
        markupSlots: {
            closeNode: function(){return this.domNode.firstChild;},
            searchNode: function(){return this.domNode.lastChild;}
        },
        top: '-10000px',
        markupMethods: {
            onleftChange: function() {if (this.left && this.domNode) this.domNode.style.left = this.left;},
            onrightChange: function() {if (this.left && this.domNode) this.domNode.style.right = this.right;},
            ontopChange: function() {if (this.left && this.domNode) this.domNode.style.top = this.top;},
            oncssTextChange: function() {this.domNode.style.cssText = this.cssText || '';}
        },
        
        currentHandle: null, 
        quickSearch: null, 
        reset: function(){
            if (this.searchNode.firstChild) {
                this.searchNode.removeChild(this.searchNode.firstChild);
            }
        },
        close: function(){
            this.onclick();
        },
        onClose: null, //callback function
        onclick: function(evt) { //close button handler
            this.set('top', '-10000px');

            this.reset();
                
            if (this.onClose) {
                this.onClose();
            }
        },
        onHover: null, //callback function
        onmouseover: function(evt) {

            if (this.onHover) {
                this.onHover(evt.e);
            }
            return true;
        }
        }
); 
 

}
)();