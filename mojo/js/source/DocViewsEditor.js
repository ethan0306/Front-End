(function(){
    mstrmojo.requiresCls(
    		"mstrmojo.func",
            "mstrmojo.array",
            "mstrmojo.hash",
            "mstrmojo.HBox",        
            "mstrmojo.Label",
            "mstrmojo.DropDownButton",
            "mstrmojo.ListMapperTable",
            "mstrmojo.DataGrid", 
            "mstrmojo.Pulldown",
            "mstrmojo.CheckBox",
            "mstrmojo.Editor",
            "mstrmojo.ValidationTextBox",
            "mstrmojo.Button");
    var _TR = mstrmojo.validation.TRIGGER,
    	_UMSave = true, // using update manager to save, other wise task.
    	_DTP = mstrmojo.expr.DTP,
    	_H = mstrmojo.hash,
    	_O = mstrmojo.Obj,
    	_S = mstrmojo.string,
    	_N = mstrmojo.num,
    	_DVPS = ['n','srx','sry','ori'],
    	_FIELD = { // bit field aggregated the field
    		NAME: 0x1,
    		RESX: 0x2,
    		RESY: 0x4
    	},
    	_ORI = {
    			P: 0,
    			L: 1,
    			PL: 2,
    			NON: -1
    	},
    	_MTP = {MODIFY:122, // same with the ones defined in EnumDSSXMLRWManipulationMethod.java 
    			ADD:119,
    			REMOVE:120};
    //pre process the defined and predefined view list
    function _preProcessModel(res){
		var def = res.views,
			sz = def.length,
			i = 0,
			desc = mstrmojo.desc(3678,'Custom');
		
		for(;i<sz;i++){
			def[i] = _H.make(def[i], _O);
			def[i].set('vi',i);
		}
    }
    //generate XML saving views
	function _getXML(actions){
        var cfg = {
                isSerializable: function(nodeName, jsons, idx){
                    switch(nodeName){
                    case 'mtp':
                    case 'n':
                    case 'srx':
                    case 'sry':
                    case 'ori':
                    case 'idx':
                    case 'mus':
                        return true;
                    }
                    return false;
                },
                getArrItemName: function(n, v, i){
                	return 'mu';
                }
        };
        return _S.json2xml('manipulations', actions, cfg);
	}
	
    mstrmojo.docViewsEditorModel = {
	        id:'dveModel',
	        scriptClass: 'mstrmojo.Model',
	        maxNameLen: 255,
	        defined: [],
	        curViewIndex: -1,
	        manipulations: [],
	        showHiddenObj: true,
	        _oldShowHiddenObj: true,
	        _enableShowHiddenObj: true,
	        um: microstrategy.updateManager,
	        invalid: false,
	        invalidNameReg: /[\[\]\\"]/,
	        initModel: function(m){
    			var me = this;
    			
    			_preProcessModel(m);
    			
				me.set('defined',m.views);
				me.set('curViewIndex',m.cvi);
				me.set('_enableShowHiddenObj', m.sho != undefined);
				me.set('showHiddenObj', m.sho? true:false);
				me.set('_oldShowHiddenObj', m.sho? true:false);
				me.manipulations = [];
			},
			checkOrientations: function(){
				var vl = this.defined,
					sz = vl.length,
					v,
					ori,
					i=1;
				if(sz == 0) return _ORI.NON;
				ori = vl[0].ori;
				for(;i<sz;i++){
					v= vl[i];
					if(v.ori == _ORI.PL || v.ori != ori){
						return _ORI.PL;
					}
				}
				return (ori == _ORI.PL) ? _ORI.PL : ori;
			},
			hasDuplicatedViews: function(){
				var vl = this.defined,
					sz = vl.length,
					vm = [],
					k,
					v,
					i=0;
				for(;i<sz;i++){
					v= vl[i];
					k = v.srx + '~' + v.sry + '~' + '~' + v.ori;
					if(vm[k]){
						return true;
					}
					vm[k] = true;
				}
				return false;
			},

			viewNameContainInvalidChars: function(idx){
				var v = this.defined[idx].n,
					reg = this.invalidNameReg;
				return v && reg && reg.test(v);
			},
			
			isViewNameUnique: function(idx){
				var vl = this.defined,
				name = vl[idx].n,
				sz = vl.length,
				i = 0;
				for(;i<sz;i++){
					if(i != idx && name && vl[i].n && trim(name).toLowerCase() == trim(vl[i].n).toLowerCase()){
						return false;
					}
				}
				return true;
			},
			getDupViewName: function(n){
				var vl = this.defined,
				sz = vl.length,
				maxLen = this.maxNameLen,
				nph = mstrmojo.desc(3652,'Copy (###) of ##'),
				nm = mstrmojo.desc(3651,'Copy of ##').replace('##',n).substring(0, maxLen);
				
				for(var i=1; i<sz; i++){// try only length-1 times
					for(var j=0;j<sz;j++){
						if(nm == vl[j].n){ 	// compare the name with every existing view's name
							break;			// If there's a duplication, try the next name.
						}
					}
					if(j == sz){ // If can't find a duplication, then 'nm' could be the new name.
						break;
					}
					nm = nph.replace('###', i+1).replace('##',n).substring(0, maxLen); // generate a new name
				}
				return nm;
			},
			isViewValuesUnique: function(idx){
				var vl = this.defined,
					sz = vl.length,
					cv = vl[idx],
					v,
					i = 0;
				
				for(;i<sz;i++){
					v = vl[i];
					if(i!=idx && (cv.srx == v.srx && cv.sry == v.sry && cv.ori == v.ori)){
						return false;
					}
				}
				return true;
			},
			setCurDocView: function(idx){
				this.set('curViewIndex',idx);
			},
	        setDocView: function(idx, n, v){
				this.defined[idx].set(n, v);
				this.defined[idx].isDirty = true;
			},
			/** set the invalid/valid info of a view  
			 * @param idx index of the view
			 * @param v indicate invalid or not. True = invalid, False = valid
			 * @param field indicate the invalid or valid field, value from _FIELD
			 */
			setDocViewInvalid: function(idx,v,field){
				var vl = this.defined;
					sz = vl.length,
					i=0,
					inv = false;
				var invalid = vl[idx].invalid;
				if(!invalid) invalid = 0;
				invalid = v ? (invalid | field) : (invalid & ~field);
				vl[idx].set('invalid', invalid);
				
				if(invalid){
					this.set('invalid',true);
				}else{
					for(;i<vl.length;i++){
						if(vl[i].invalid){
							inv = true;
							break;
						}
					}
					this.set('invalid',inv);
				}
			},
			onremoveDocView: function(idx){
				var vl = this.defined,
					sz,
					i,
					vi,
					cvi= this.curViewIndex,
					newVi;
				
				//update the index property
				i=idx;
				sz = vl.length;
				for(;i<sz;i++){
					v = vl[i];
					v.set('vi',v.vi-1);
				}
				if(idx<=cvi){
					newVi = (cvi - 1) >= 0 ? (cvi - 1) : 0;
					this.setCurDocView(newVi);
				}
				this._queueRemoveAction(idx);
			},

			
			onaddDocView: function(view){
				this._queueAddAction(view);
			},
			
			_queueRemoveAction: function(idx){
				if(_UMSave) this.manipulations.push(this.um.createActionObject(null, mstrUpdateManager.REMOVE_DOC_VIEW, mstrUpdateManager.applyChangesBeanPath, ['2048235','2048018'], [idx, 'false'], [],[]));
				else this.manipulations.push({'mtp':_MTP.REMOVE,'idx':idx}); //backend array starts with 1
			},
			
			_queueAddAction: function(view){
				var ma = _H.copyProps(_DVPS,view);
				ma.idx = view.svi; //source view index, backend array starts with 1
				ma.mtp = _MTP.ADD;
				if(_UMSave) this.manipulations.push(this.um.createActionObject(null, mstrUpdateManager.ADD_DOC_VIEW, mstrUpdateManager.applyChangesBeanPath, ['2048235','2048236','2048237','2048238','2048240','2048018'], [ma.idx,ma.n,ma.srx,ma.sry,ma.ori,'false'], [],[]));
				else this.manipulations.push(ma);
			},
			
			_getDirtyViewActions: function(){
				//find all the dirty views
				var vl = this.defined,
					sz = vl && vl.length,
					i=0,
					v,
					ma,
					ac=[];
				if(sz){
					for(;i<sz;i++){
						v = vl[i];
						if(v.isDirty){
							ma = _H.copyProps(_DVPS,v);
							ma.mtp = _MTP.MODIFY;
							ma.idx = v.vi;
							if(_UMSave) ac.push(this.um.createActionObject(null, mstrUpdateManager.EDIT_DOC_VIEW, mstrUpdateManager.applyChangesBeanPath, ['2048235','2048236','2048237','2048238','2048240','2048018'], [ma.idx,ma.n,ma.srx,ma.sry,ma.ori,'false'], [],[]));
							else ac.push(ma);
						}
					}
				}
				return ac;
			},
			
			flushChanges: function(editor){
//				if(this.manipulations.length==0 && this._getDirtyViewActions().length == 0) return;
				if(_UMSave){
					editor.close();
					var acs=this.manipulations.concat(this._getDirtyViewActions());
					if(acs.length) {
						this.um.add(acs);
					}
					
					// only set this property if it is changed
					if(this._oldShowHiddenObj != this.showHiddenObj) {
						var data = mstrUpdateManager.createPropertyEditString(null, "ShowHiddenObjects", this.showHiddenObj?'1':'0');
						this.um.add([this.um.createActionObject(null, mstrUpdateManager.SAVE_DOC_PROPERIES, mstrUpdateManager.applyChangesBeanPath, ["2048065"], [data], [],[])]);
					}
					
					this.um.add([this.um.createActionObject(null, mstrUpdateManager.SET_CUR_DOC_VIEW, mstrUpdateManager.applyChangesBeanPath, ['2048235','2048018'], [this.curViewIndex, 'true'], [],[])]);

					this.um.flushAndSubmitChanges();
					return;
				}else{
					var params = {
		                    taskId: 'saveRWDocumentViews',
		                    msgID: this.msgID,
		                    docViewManipulationsXML: _getXML({'mus':this.manipulations.concat(this._getDirtyViewActions())})
		            };
//					alert(params.xml); //debug
					var index = this.curViewIndex;
		            mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
		                success: function(res) {
		            		editor.close();
		            		var um = microstrategy.updateManager;
		            		um.add([um.createActionObject(null, mstrUpdateManager.SET_CUR_DOC_VIEW, mstrUpdateManager.applyChangesBeanPath, ['2048235','2048018'], [index, 'true'], [],[])]);
		            		um.flushAndSubmitChanges();
		                },
		                failure: function(res) {
		                    mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
		                    if(isToClose) {
		                        e.close();
		                    }                    
		                }
		            }, params);
				}
			}
	};
    
	mstrmojo.DocViewsEditor = {
			id: 'mstrDVE',
	        scriptClass: 'mstrmojo.Editor',
	        help: 'document_views_editor.htm',
	        title: mstrmojo.desc(8500, 'Manage Views'),
	        cssClass: 'mstrmojo-DVEditor',
	        banding: true,
	        zIndex: 112,
	        model: mstrmojo.docViewsEditorModel,
			
			initModel: function(views){
				this.model.initModel(views);
			},
			postCreate: function(){
				this.set('model', mstrmojo.insert(this.model));
			},
	        children:[
	                  {
	                	  scriptClass: 'mstrmojo.Label',
	                	  text: mstrmojo.desc(8497,'Manage Views and associate runtime parameters for View selection on the mobile device')
	                  },
	                  {
	                	  scriptClass: 'mstrmojo.DataGrid',
	                	  cssClass: 'mstrmojo-DVEditor-DocViewList',
                          bindings:{
                              items: "this.parent.model.defined"
                          },
                          renderOnScroll: false,
                          makeObservable: true,
              	          onadd: function(evt){
              				var v= evt.value;
              				if(v && v.length){
              					this.parent.model.onaddDocView(v[0]);
              				}
              				
              			  },
              			  onremove: function(evt){
              				var idx = evt.index;
              				if(idx>-1){
              					this.parent.model.onremoveDocView(idx);
              				}
              				
              			  },
	                	  columns:[
	                               {	                                   
	                            	   headerText: mstrmojo.desc(945,'Name'),
	                                   colCss: 'nameCol',
	                                   dataWidget:{
		                            	   	scriptClass: 'mstrmojo.ValidationTextBox',
		                            	   	cssClass: 'mstrmojo-DVEditor-name',
		                            	    bindings:{
                            	   				value: 'this.data.n',
                            	   				maxLength: 'this.parent.dataGrid.parent.model.maxNameLen'
		                            	    },
		                            	    dtp: _DTP.VARCHAR,
		                            	    
		                            	    required: true,
		                            	    constraints: {
                      	   	          		  trigger: _TR.ALL,
                      	   	          		  validator: function(v) {
		                            	    	var m = this.dataGrid.parent.model,
		                            	    		idx = this.data.vi,
		                            	    		_CODE = mstrmojo.validation.STATUSCODE;
		                            	    	
		                            	    	if(m.viewNameContainInvalidChars(idx)){
		                            	    		return {code: _CODE.INVALID_CHAR, 
                                                     	msg: mstrmojo.desc(8622, 'The # cannot contain the reserved characters ##.').replace('##', "[]\"\\").replace('#', mstrmojo.desc(945,'Name'))
		                            	    		};
		                            	    	}
                            	    			
		                            	    	if(!m.isViewNameUnique(idx)){
                            	    				return {code: _CODE.INVALID_VALIDATOR, 
	                                                         	msg:mstrmojo.desc(8496, 'A View with the same name exists.')};
    	                            	    	}
                            	    			
                            	    			return {code : _CODE.VALID, msg: ''};  
    	                                        
    			                              }
                      	   	          	  	},
                      	   	          	  	onInvalid: function(){
                      	   	          	  		this.parent.dataGrid.parent.model.setDocViewInvalid(this.parent.data.vi, true, _FIELD.NAME);
                      	   	          	  	},
                      	   	          	  	onValid: function(){
                      	   	          	  		this.parent.dataGrid.parent.model.setDocViewInvalid(this.parent.data.vi, false, _FIELD.NAME);
                      	   	          	  	},
		                            	    postCreate: function(){
		                            	    	this.value = this.data.n;
		                            	    },
	                               			onvalueChange: function(){
		                            	    	this._super();
		                            	    	this.dataGrid.parent.model.setDocView(this.data.vi,'n',this.value);
		                            	    }
	                               		}
	                               },
	                              
	                               {
		                               headerText: mstrmojo.desc(8491, 'Resolution (pixels)'),
		                               colCss: 'resolutionCol', 
		                               
		                               dataWidget:{
		                            	   	 scriptClass: 'mstrmojo.HBox',
			                            	 cssClass: 'mstrmojo-DVEditor-resolution',
			                            	 children:[
			                            	   	          {
			                                                  scriptClass: "mstrmojo.ValidationTextBox",
			                                                  cssClass: 'mstrmojo-DVEditor-resolutionX',
			                                                  tooltip: mstrmojo.desc(2985,'Width'),
			                                                  bindings:{
			                            	   					value: 'this.parent.data.srx'
			                            	   	          	  },
			                            	   	          	  dtp: _DTP.INTEGER,
			                            	   	          	  required: true,
			                            	   	          	  constraints: {
			                            	   	          		  min: 1,
			                            	   	          		  trigger: _TR.ALL
			                            	   	          	  },
			                            	   	          	  onInvalid: function(){
			                            	   	          		  this.parent.dataGrid.parent.model.setDocViewInvalid(this.parent.data.vi,true, _FIELD.RESX);
			                            	   	          	  },
			                            	   	          	  onValid: function(){
			                            	   	          		this.value = _N.parseInteger(this.value,10);
			                            	   	          		this.parent.dataGrid.parent.model.setDocViewInvalid(this.parent.data.vi, false, _FIELD.RESX);
			                            	   	          	  },
			                            	   	          	  postCreate: function(){
			                            	   	          		  this.value = this.parent.data.srx;
			                            	   	          	  },
			                            	   	          	  onvalueChange: function(){
			                            	   	          		  this._super();
			                            	   	          		  this.parent.dataGrid.parent.model.setDocView(this.parent.data.vi,'srx',_S.trim(this.value));
			                            	   	          	  }
			                            	   	          },
			                            	   	          
			                            	   	          {
			          	                  		        	scriptClass: 'mstrmojo.Label',
			          	                  		        	cssClass: 'mstrmojo-DVEditor-times',
			          	                  		        	text: 'x'
			          	                  		          },
			          	                  		          
			                            	   	          {
			                                                  scriptClass: "mstrmojo.ValidationTextBox",
			                                                  cssClass: 'mstrmojo-DVEditor-resolutionY',
			                                                  tooltip: mstrmojo.desc(2983,'Height'),
			                                                  bindings:{
			                            	   					value: 'this.parent.data.sry'
			                            	   	          	  },
			                            	   	          	  dtp: _DTP.INTEGER,
			                            	   	          	  required: true,
			                            	   	          	  constraints: {
			                            	   	          		  min: 1,
			                            	   	          		  trigger: _TR.ALL
			                            	   	          	  },
			                            	   	          	  onInvalid: function(){
			                            	   	          		  this.parent.dataGrid.parent.model.setDocViewInvalid(this.parent.data.vi, true, _FIELD.RESY);
			                            	   	          	  },
			                            	   	          	  onValid: function(){
			                            	   	          		this.value = _N.parseInteger(this.value,10);
			                            	   	          		this.parent.dataGrid.parent.model.setDocViewInvalid(this.parent.data.vi, false, _FIELD.RESY);
			                            	   	          	  },
			                            	   	          	  postCreate: function(){
			                            	   	          		  this.value = this.parent.data.sry;
			                            	   	          	  },
			                            	   	          	  onvalueChange: function(){
			                            	   	          		  this._super();
			                            	   	          		  this.parent.dataGrid.parent.model.setDocView(this.parent.data.vi,'sry',_S.trim(this.value));
			                            	   	          	  }
			                            	   	          }
			                            	   	      ]
			                           		}
	                               },
	                               {
	                            	   headerText: mstrmojo.desc(2879,'Orientation'),
		                               colCss: 'orientationCol',
	                            	   dataWidget:{
	                            	   	scriptClass: 'mstrmojo.Pulldown',
	                            	   	itemIdField: 'v',
	                            	   	popupToBody: true,
	                            	   	popupZIndex: 122,
	                            	   	bindings:{
	                            	   		value: "this.data.ori"
	                               		},

	                            	   	items:[
	                            	   	       {n:mstrmojo.desc(6165,'Portrait and Landscape'), v:_ORI.PL},
	                            	   	       {n:mstrmojo.desc(6166,'Portrait Only'), v:_ORI.P},
	                            	   	       {n:mstrmojo.desc(6167,'Landscape Only'), v:_ORI.L}
	                            	   	       
	                            	   	 ],
		                               	postCreate: function(){
	                               			this.value = this.data.ori;
	                            	    },
	                            	   	onvalueChange: function(evt){
	                               			if(this._super) this._super();
	                               			this.dataGrid.parent.model.setDocView(this.data.vi,'ori',this.selectedItem.v);
	                               		}
	                               	  }
	                               },
	                               {
	                            	   headerText: mstrmojo.desc(8492, 'Current View'),
		                               colCss: 'currentCol',
	                            	   dataWidget:{
	                            	   	scriptClass: 'mstrmojo.RadioButton',
	                            	   	name: 'current',
	                            	   	cssClass: 'mstrmojo-DVEditor-current',
	                            	   	cssDisplay: 'block',
	                            	   	bindings:{
	                            	   		checked: function(){
	                            	   			var mcur = this.dataGrid.parent.model.curViewIndex;
	                            	   				dcur = this.data.vi;
	                            	   			return mcur == dcur;
	                               			}	
	                               		},
	                            	   	onclick: function(){
	                            	   		this.dataGrid.parent.model.setCurDocView(this.data.vi);
	                               		},
	                               		postCreate: function(){
                            	   			var mcur = this.dataGrid.parent.model.curViewIndex;
                            	   				dcur = this.data.vi;
                            	   			this.checked = (mcur == dcur);
	                               		}
	                               	  }
	                               },
	                               {
	                            	   headerText: mstrmojo.desc(3265,'Actions'),
		                               colCss: 'actionsCol',
	                            	   dataWidget:{
	                            	   	scriptClass: 'mstrmojo.HBox',
	                            	   	cssClass: 'mstrmojo-DVEditor-actions',
	                            	   	children:[
	                            	   	          {
	                                                  scriptClass: "mstrmojo.Button",
	                                                  cssClass: "mstrmojo-DVEditor-duplicate",
	                                                  text: "",
	                                                  title: mstrmojo.desc(3397,'Duplicate'),
	                                                  bindings:{
	                            	   	        	  	enabled: '!this.parent.data.invalid'
	                            	   	          	  },
	                                                  onclick: function(evt){
	                            	   	        	  	  var p = this.parent,
	                            	   	        	  	  	  dg = p.dataGrid,
	                            	   	        	  	  	  src = p.data,
	                            	   	        	  	  	  m = dg.parent.model,
	                            	   	        	  	  	  item;
	                            	   	        	  	  item = _H.make(_H.copyProps(_DVPS,src),_O);
	                            	   	        	  	  item.set('n',  m.getDupViewName(src.n));
	                            	   	        	  	  item.set('vi', m.defined.length);
	                            	   	        	  	  item.svi = src.vi;//source view index;
	                                                      dg.add([item],item.vi);
	                                                  }
	                            	   	          },
		                            	   	       {
		                                                  scriptClass: "mstrmojo.Button",
		                                                  cssClass: "mstrmojo-DVEditor-delete",
		                                                  text: "",
		                                                  title: mstrmojo.desc(629,'Delete'),
		                                                  bindings: {
		                                                	  enabled: "this.parent.dataGrid.parent.model.defined.length > 1"
		                                                  },
		                                                  postCreate: function(){
		                            	   	        	  	this.enabled = this.parent.dataGrid.items.length > 1;
		                            	   	          	  },
		                                                  onclick: function(evt){
		                            	   	        	  	var p= this.parent,
		                            	   	        	  		dg = p.dataGrid,
		                            	   	        	  		d = p.data;
		                                                      dg.remove([d.vi]);
		                                                  }
		                            	   	          }
	                            	   	          ]
	                               	  	}
	                               }	                               
	                              ]
	                  	},
	                  	{
	                  		scriptClass: "mstrmojo.HBox",
	                  		children:[
	                  		         {
	                  		        	scriptClass:'mstrmojo.CheckBox',
	                  		        	name: 'showHidden',
	                  		        	bindings:{
	                  		        	 	checked: 'this.parent.parent.model.showHiddenObj',
	                  		        	 	enabled: "this.parent.parent.model._enableShowHiddenObj"
                                        },
	                  		         	onclick: function(){
	                  		        	 	this.parent.parent.model.set('showHiddenObj',this.checked);
	                  		         	}
	                  		         },
	                  		         {
	                  		        	scriptClass: 'mstrmojo.Label',
	                  		        	text: mstrmojo.desc(8493,'Show hidden objects in Design Mode')
	                  		         }
	                  		         ]
	                  	},
	                  	{
	                        scriptClass: "mstrmojo.HBox",
	                        cssClass: "mstrmojo-Editor-buttonBox",
	                        slot:"buttonNode",
	                        children: [     
	                                   {//buttons
	                                       scriptClass: "mstrmojo.HTMLButton",
	                                       cssClass: "mstrmojo-Editor-button",
	                                       text: mstrmojo.desc(1442,"OK"),
	                                       bindings: {
	                                           enabled: '!this.parent.parent.model.invalid'
		                                       	   
	                                       },
	                                       onclick: function(evt){
	                                           var e = this.parent.parent,
	                                           	   m = e.model,
	                                           	   cori = m.checkOrientations();
	                                           	   
	                                           if(m.hasDuplicatedViews()){
	                                        	   mstrmojo.alert(mstrmojo.desc(8495, "A View with the same configuration exists."));
	                                           }else if(cori != _ORI.PL) {
	                                        	   var fn = function(){
	                                        		   m.flushChanges(e);
	                                        	   },
	                                        	   msg = mstrmojo.desc(8494, "There are no Views for # orientation. Do you want to continue?"),
	                                        	   rMsg;
	                                        	   if(cori == _ORI.P){
	                                        		   rMsg = msg.replace('#', mstrmojo.desc(3030,'Landscape'));
	                                        	   } else if (cori == _ORI.L){
	                                        		   rMsg = msg.replace('#', mstrmojo.desc(3029,'Portrait'));
	                                        	   }
	                                        	   if(mstrConfig.simpleDialog){
	                                        		   if(mstrmojo.confirm(rMsg)){
	                                        			   fn();
	                                        		   }
	                                        	   }else{
	                                        		   mstrmojo.confirm(rMsg,[mstrmojo.Button.newInteractiveButton(mstrmojo.desc(219,"Yes"),fn),
		                                        	                          mstrmojo.Button.newInteractiveButton(mstrmojo.desc(218,"No"))]);   
	                                        	   }
	                                           }else{
	                                        	   m.flushChanges(e);
	                                           }
	                                           
	                                       }
	                                   },                                
	                                    {//buttons
	                                        scriptClass: "mstrmojo.HTMLButton",
	                                        cssClass: "mstrmojo-Editor-button",
	                                        text: mstrmojo.desc(221,"Cancel"),
	                                        onclick: function(evt){
	                                            this.parent.parent.close();
	                                        }
	                                    }
	                            ]
	                    }
	                  ]
	};
})();