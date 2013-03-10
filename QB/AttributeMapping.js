(function(){
   
	mstrmojo.requiresCls(
            "mstrmojo.Table",        
            "mstrmojo.Label",
            "mstrmojo.Box",
            "mstrmojo.TreeBrowser",
            "mstrmojo.fx"
    );
	
	mstrmojo.requiresDescs(8953,9135);
	
	
	var STR_SUGGEST = mstrmojo.desc(8953, "Suggestions");
	var STR_NOMATCH = mstrmojo.desc(9135, "No match found");
	var STR_ERR_FORM_USED = "The attribute form you select has been mapped. Please choose a different one.";
	var _D = mstrmojo.dom;
	var _C = mstrmojo.css;
	var OFFSET_WIDTH = 16;
	
	 /**    
     *  Get all forms of given attribute
     * @param {data} data containing the attribute id
     * @param {callbacks} callbacks
     * @private
     */
	function _getAttributeForms(data,callbacks){
		var aid = data.did, an = data.n;
		var cb = {
			success: function(res){
			     if (res.container){
			    	 var fms = res.container.dssforms;
			    	 fms = fms? fms: [];
			    	 for (var i=0, len=fms.length; i<len; i++) {			    		
			    		 fms[i].aid = aid;
			    		 fms[i].an = an;
			    		 fms[i].did = aid + fms[i].dssid;
			    		 fms[i].idf = fms[0].dssid; //attach id form info
			    	 }	 
			         if (callbacks && callbacks.success)	{
			        	 callbacks.success({items:fms}); 
			         }
			     }	 
		    },
		    failure: function(res){		    
			   mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
		    }
		};	
		
		var param = { taskId: 'getAttributeForms',
				attributeID:  aid,
				displayedForms: 0  //EnumWebDisplayedForms.WebDisplayedFormsAll  
		}		
		
		mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, cb, param);
		
	};	
		
	mstrmojo.QB.AttributeMapping = mstrmojo.declare(
			
		mstrmojo.Container,
		
		[mstrmojo._IsPopup],
		
		{
			scriptClass:  "mstrmojo.QB.AttributeMapping",
								
			markupString: '<div id="{@id}"  class="mstrmojo-Editor {@cssClass}" style="top:{@top};left:{@left};">' +
				              '<div style="z-index:{@zIndex};{@cssText}" mstrAttach:mousedown>' + 
						          '<div class="mstrmojo-qb-mapping-searchbox" mstrAttach:click >' + 
				                        '<input class="mstrmojo-SearchBox-input mstrmojo-qb-mapping-searchinput" type="text" ' + 
				                            ' mstrAttach:keyup,blur' +      
				                        '/>' +
				                        '<span class="mstrmojo-qb-mapping-spinnerbox" style="width:20px;">' +                                      
                                            '<span class="mstrmojo-SearchBox2-spinner" id="{@id}sbSpinner"></span>' + 
                                        '</span>' +
				                  '</div>' +
				                  '<div class="mstrmojo-qb-mapping-search-status"></div>' +	
				                  '<div class="mstrmojo-qb-mapping-search-content"></div>' +				                 
				                  '<div class="mstrmojo-qb-mapping-buttons"></div>' +
				              '</div>' +
				              '<div class="mstrmojo-Editor-curtain"></div>' + 
				          '</div>',
			          
            markupSlots: {
				              contentNode: function(){return this.domNode.firstChild.childNodes[2];},
				              inputNode: function(){return this.domNode.firstChild.firstChild.firstChild;},
				              spinnerNode: function(){return this.domNode.firstChild.firstChild.lastChild.lastChild;},
				              buttonNode: function(){return this.domNode.firstChild.childNodes[3];},
				              statusNode: function(){return this.domNode.firstChild.childNodes[1];},
			                  curtainNode: function(){return this.domNode.lastChild;}
			             },	
			             
			rootID: 'D43364C684E34A5F9B2F9AD7108F7828',
			
			blockCount: 50,
			
			cssClass: 'mstrmojo-qb-mapping-editor',
			
			autoSearch: microstrategy.enableQuickSearch,
			
			autoSearchDelay: microstrategy.searchAutoCompleteDelay,
				              
			children: [
			           {
			        	   scriptClass: "mstrmojo.TreeBrowser",
			        	   slot: 'contentNode',
			        	   alias: 'tree',
			        	   noCheckBox: false,
			        	   itemIdField: 'did',
			        	   cssClass: "mstrmojo-qb-mapping-tree",
			        	   items: [],
			        	  
			        	   isBranch: function isBranch(data){
			                    return data.items;
			               },
			        	   item2textCss: function item2textCss(data){
			            	    return  ("mstrmojo-ArchitectListIcon " +  (data.items ? "t12" : "t21"));
				           },
				           
				           selectionAcrossBranch: false,
 				           
				           listSelector: mstrmojo.ListSelector,
				           
				           multiSelect: false,
 				          				          				           
 				           getContentThroughTaskCall: function getContentThroughTaskCall(params, callbacks){ 				               
 				                var me=this;
 					            if (params.isRoot){
 					            	callbacks.success(me.items);
 					            }else {
 					            	_getAttributeForms(params.data,callbacks);
 					            }  			            	
 				            }
			        	   
			           },
			           {
			        	    scriptClass : 'mstrmojo.Label',
							cssClass : 'mstrmojo-qb-mapping-status',
							slot : 'statusNode',
							alias : 'status',
							text: STR_SUGGEST
			           
			           },
			           {  
							scriptClass : 'mstrmojo.HBox',
							cssClass : 'mstrmojo-qb-mapping-buttonbox',
							slot : 'buttonNode',
							children : [ 
							{//OK
								scriptClass : "mstrmojo.HTMLButton",
								cssClass : "mstrmojo-Editor-button",
								cssText: "float: right",
								text : mstrmojo.desc(1442, "OK"),
								onclick : function(evt) {
								    var mp = this.parent.parent;									 
									var sls = mp.children[0].getTotalSelections();
									if (sls && sls.length>0) {
										var m = mstrmojo.all.QBuilderModel;
										var cb = {
										    success: function(){
											    mp.close();
											    var w = mp.target;
											    m = m.mappings;
											    var idx = mstrmojo.array.find(m, 'did', mp.did);
											    m[idx].alias = sls[0].an;
											    m[idx].ipa = 1;
											    m[idx].fmn = sls[0].n;
											    m[idx].tp = 12;
											    m[idx].nochange = true;
											    w.dataGrid.populatePreview();
										    },
										    failure: function(res){										    	
										    	mp._displayError(res);
										    }	
										}		
										m.mapAttribute(mp.did, sls[0].aid, sls[0].dssid, sls[0].idf, cb);										
									}										
								   
								}
							}, 
							{// cancel
								scriptClass : "mstrmojo.HTMLButton",
								cssClass : "mstrmojo-Editor-button",
								text : mstrmojo.desc(221, "Cancel"),
								onclick : function(evt) {
								     var mp = this.parent.parent;
								     mp.close();
								}
							}
						]}
			           
			           
			],
			
			 /**    
		     *  Display msg on the status bar		     
		     * @param {msg} msg to display
		     * @private
		     */
			_displayError: function _displayError(msg) {
			    var bar = this.status;
		        bar.set("text", msg);
		    	bar.set("title",msg);
		    	_C.addClass(bar.domNode, "error");
		    	this.adjustPosition();
		    },
			
			
			onEnter: function() {
                this._onsearch();
            },
                      
            onEsc: function(){
                if (this.onCancel) {
                    this.onCancel();
                }
                this.close();
            },
            
            close: function(){            
            	_D.detachEvent(document.body, "mousedown", this._close_handler);
            	if (this.target) {
            		_C.toggleClass(this.target.domNode, "highlight", false); 	
            	}            	 
            	this.buttonNode.style.display ='none';
            	this.statusNode.style.display ='none';            	 
            	this.slideProp(false,this.contentNode,95);            	            	
            	this.slideProp(false,this.inputNode,16);            
            	
            	var node = this.domNode;
            	self.setTimeout(function () {
            		document.body.removeChild(node);
                 }, 510);            	
            },	
            
            /**
             * <p>Handle keyup events</P> 
             * 
             * @param {DOMEvent} evt
             * @private
             */
            onkeyup: function onkeyup(evt) {
                var hWin = evt.hWin,
                    e = evt.e || hWin.event;
                
                // process Enter key
                if (this.onEnter && e.keyCode === 13) {
                    this.onEnter();
                    return;
                }
                
                // process escape key
                if (this.onEsc && e.keyCode === 27) {
                    this.onEsc();
                    return;
                }
                
               
                // Stop any prior timeout to do the search.
                if (this.autoSearch) {
	                if (this._autoSearchTimer) {
	                    self.clearTimeout(this._autoSearchTimer);
	                }             
                    if (this.autoSearchDelay) {
                        // If we have a delay, start a timeout.   
                    	me = this;
                        this._autoSearchTimer = self.setTimeout(function () {
                           me._onsearch();
                        }, this.autoSearchDelay);
                    } else {
                        // We have no delay, search immediately.
                    	this._onsearch();
                    }
                }
                
            },
            
            
            slideProp: function(show, node, h) {  
	            var props = { //set animation properties
			            	    target: node,
			                    props: {
			                           height: {
			                               start: (show ? 0 : h),
			                               stop: (show ? h : 0),
			                               suffix: 'px'
			                           }
			                    }
	                        };
	            var fx = new mstrmojo.fx.AnimateProp(props); //Animation instance              
	            fx.play();
            },
            
            
            clearview: function(){
            	this.tree.set("items",[]);
            	this.inputNode.value = '';
            	this.inputNode.focus();            	
            
            	this.contentNode.style.display = 'none';
            	this.statusNode.style.display = 'none';
            	this.buttonNode.style.display = 'none';
            	
            	this.slideProp(true,this.inputNode,16);
            	
            	//attach mouse down event to close context menu
                this.attachMousedownEvent();
            },	
			
			_onsearch:function(){
            	
            	//get user input by trimming off leading/trailing spaces
                var input = mstrmojo.string.trim(this.inputNode.value);
                var me = this;
                
                //First, show spinner icon
                if (this.spinnerNode) {
                    this.spinnerNode.style.display = 'block';
                }
                
                this.contentNode.style.display = 'none';
            	this.statusNode.style.display = 'none';
            	this.buttonNode.style.display = 'none';
                
                var callback = {
                	success: function(res) {	                   
	                    var itms = res.items || []; //if there is no item found.
	                    
	                	me.statusNode.style.display = 'block';
	                	
	                	if (itms.length>0) {
	                		me.status.set("text", STR_SUGGEST);	
	                		me.contentNode.style.display = 'block';
	                		me.slideProp(true,me.contentNode,95);  
	                		me.buttonNode.style.display = 'block';	                		 
	                	}else {
	                		me.status.set("text", STR_NOMATCH);	
	                	}	
	                	
	                	_C.removeClass(me.status.domNode, "error");
	                	
	                    for (var i=0, len=itms.length; i<len;i++){
	                    	itms[i].items =[];
	                    	itms[i].st = -5;
	                    }	
	                    me.children[0].set("items", itms);
	                 	                   
	                },
	                failure: function(res){
	                    if (me.showTaskError) {
	                        mstrmojo.alert(mstrmojo.desc(8117,'Data request failed:') +' \n' + res.getResponseHeader('X-MSTR-TaskFailureMsg'));
	                    }
	                },
	                complete: function(res){
	                	//hide spinner icon
                        if (me.spinnerNode) {
                            me.spinnerNode.style.display = 'none';
                        }
	                    if(me.postFetch){
	                    	me.postFetch();
	                    }                                        
	                }
                		
                };	
                var qs = microstrategy.useQuickSearch();
                
                var taskParams =  {
                		taskId: 'searchMetadata',
                        styleName: 'MojoFolderStyle',
                        rootFolderID: this.rootID,                   
                        nameWildcards : 1,
                        blockBegin: this.blockBegin || 1,
                        blockCount: this.blockCount,
                        recursive: 1,
                        folderBrowserStyle: 0,
                        includeAncestorInfo: 'true',
                        searchXML: this.searchXML || '',
                        dataSourcesXML : this.dataSources || '',
                        objectType: '12',
                        quickSearch: qs //microstrategy.useQuickSearch()	
                };
                taskParams.searchPattern = qs? input : input + '*' ;//Each result item should begin with user input
               
                mstrmojo.xhr.request('POST', mstrmojo.App.taskURL, callback, taskParams);
                
			  },
			  
			  /**
               * Monitor mouse down event to close the context menu tree if mouse down anywhere other than the tree. 
               */
              attachMousedownEvent: function attachMousedownEvent(){               
                  var me = this;
                  
                  if(!this._close_handler){
                      this._close_handler = function(){
                          if (!me.isOnMe(_D.eventTarget(self, arguments[0]))) {
                        	  
                              me.close();
                          }
                      };
                  }
                  _D.attachEvent(document.body, "mousedown", this._close_handler);  
              },
              
              isOnMe: function isOnMe(t){                
                  //on my domNode
                  return _D.contains(this.domNode.firstChild, t, true, document.body);
              },
		
              adjustPosition: function adjustPosition(){
                  var root = this.domNode,
                      box= root.firstChild,
                      h = box.offsetHeight,
                      w = box.offsetWidth,
                      wDim = _D.windowDim(),
                      pos = _D.position(box,false);
                      
                  if((pos.x + w + OFFSET_WIDTH) > wDim.w){
                      //adjust left to fit in client window
                	  box.style.left = wDim.w - w - OFFSET_WIDTH + 'px';                      
                  }
                  
                  if((pos.y + h + OFFSET_WIDTH) > wDim.h){
                      //adjust top to fit in client window
                	  box.style.top =  wDim.h - h - OFFSET_WIDTH + 'px'; 
                  }
              }
		
            
		}
		
	);		
		
})();	