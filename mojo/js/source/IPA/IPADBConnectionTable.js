/**
 * @author wxu
 */
(function() {
	mstrmojo.requiresCls("mstrmojo.css", "mstrmojo.Button", "mstrmojo.Obj", "mstrmojo.VBox", "mstrmojo.HBox", "mstrmojo.CustomizedHBox", 
	"mstrmojo.IPA.IPACacheDetail", "mstrmojo.WaitIcon", "mstrmojo.CheckBox", "mstrmojo.HTMLButton", "mstrmojo.Label", "mstrmojo.ListSelector",
	//"mstrmojo.WidgetList", "mstrmojo.WidgetListMapper", "mstrmojo.ListMapperTable", 
	"mstrmojo.DataGrid", "mstrmojo.IPA.CustomHeader");

	mstrmojo.requiresDescs(8663,8667,8734,8714,8681,8668,8708,8672,8676,8726,8675,8735,8748,8754);
	
	/**
	 * the save session state
	 */
	var _SERVER_ID = _getParameter("server");

	/**
	 * the sort array for the job table
	 */
	var _sortAsc = {
		sortAsc : new mstrmojo.Obj({
			ConnectionId : true,
			DBConnectionStatus : true,
			DBInstanceName : true,
			DBConnection : true,
			Username : true
		})
	};

	/**
	 *
	 */
	function _getDBConnections() {
		var table =mstrmojo.all.DBConnectionTable;
		if(table){
			table.set("items", []);
			table.set("waiting", true);
		}
		
		var query = "LIST ALL DATABASE CONNECTIONS;";
		mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
			success : function(res) {
				var ucs = res;
				//array
				mstrmojo.all.DBConnectionTable.set("waiting", false);
				if(ucs && ucs.length > 0) {
					mstrmojo.all.DBConnectionTable.set('items', ucs);
				}
			},
			failure : function(res) {
				mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
			},
			complete : function() {
			}
		}, {
			taskId : 'CRCommandExecutionTask',
			serverId : _SERVER_ID,
			command : query
		});
	}

	/**
	 *
	 */
	function _disconnect() {
		var connections = mstrmojo.all.DBConnectionTable.items;
		var uc = [];
		if(connections) {
			for(var i = 0; i < connections.length; i++) {
				if(connections[i].selected) {
					uc.push(connections[i].ConnectionId);
				}
			}
		}

		if(uc.length > 0) {
			var ids = uc.toString();
			mstrmojo.xhr.request('POST', mstrConfig.taskURL, {
				success : function(res) {
					mstrmojo.alert(mstrmojo.desc(8754,"Selected database connections were disconnected successfully."))
					var newItems = [];
					for(var i = 0; i < connections.length; i++) {
						if(!connections[i].selected) {
							newItems.push(connections[i]);
						}
					}

					if(newItems.length > 0) {
						mstrmojo.all.DBConnectionTable.set('items', newItems);
						//updatechartwithcache(newItems);
					}
				},
				failure : function(res) {
					mstrmojo.alert(res.getResponseHeader('X-MSTR-TaskFailureMsg'));
				},
				complete : function() {
				}
			}, {
				taskId : 'CRCommandExecutionTask',
				serverId : _SERVER_ID,
				command : "DISCONNECT DATABASE CONNECTION " + ids + ";"
			});
		}
	}

	/**
	 *
	 * @param {Object} dbss the db connection status integer
	 */
	function _getStatus(dbss) {
		switch(dbss) {
			case 0:
				return mstrmojo.desc(8663,"Busy");
			case 1:
				return mstrmojo.desc(8667,"Cached");
		}

		return mstrmojo.desc(8734,"unknown");
	}

	/**
	 * gui part
	 *
	 * create  projects drop down and the project cache table
	 */
	mstrmojo.IPA.IPADBConnectionTable = mstrmojo.declare(mstrmojo.VBox, null, {
		postCreate : function() {
			_SERVER_ID = _getParameter('server');
			_getDBConnections();

		},
		scriptClass : "mstrmojo.VBox",
		id : "IPADBConnectionTable",
		cssText : "width: 98%;",
		lastSelectedConnectionID : null,
		children : [{
			scriptClass : "mstrmojo.CustomizedHBox",
			cssText : "width:98%;",
			children : [
			{
				scriptClass : "mstrmojo.HTMLButton",
				cssClass : "IPA-popupButton",
				cssText : "margin-left: 10px;",
				tdCssClass: "mstrmojo-projectpulldown-refresh",
				text : mstrmojo.desc(8714,"Refresh"),
				onclick : function() {
					_getDBConnections();
					mstrmojo.all.disconnectDBBtn.set("enabled", false);
				}
			}, 
			{
				scriptClass : "mstrmojo.HTMLButton",
				id:"disconnectDBBtn",
				cssText : "margin-left: 35px;",
				cssClass : "IPA-popupButton",
				tdCssClass : "mstrmojo-projectpulldown-delete",
				text : mstrmojo.desc(8681,"Disconnect"),
				enabled: false,
		        postBuildRendering: function postBuildRendering() {
           			if (this._super) {
                		this._super();
            		}
					
					this.domNode.disabled = true;
				},
				onclick : function() {
					mstrmojo.insert({
    		            scriptClass: 'mstrmojo.WarningDialog',
    		            id:"DBConnectionDialog",
    		            title: mstrmojo.desc(3610,"MicroStrategy Web"),
    		            width: '475px',
    		            buttons:[
    		                     mstrmojo.Button.newInteractiveButton(
    		                    		mstrmojo.desc(8708,"OK"),
    		                    		 function(){
										 	mstrmojo.all.DBConnectionDialog.destroy();	
    		                    			 _disconnect();    		 						
    		                    		 },
    		                    		 null
    		                     	),
    		                     mstrmojo.Button.newInteractiveButton(
    		 							mstrmojo.desc(8668,"Cancel"),    		 							    		 							
    		 							function()
                                        {
    		 								debugger;
                                        	mstrmojo.all.DBConnectionDialog.destroy();
                                        },
    		 							null
    		 						)
    		                    ],
    		            children: [{
            		                scriptClass: 'mstrmojo.Label',
            		                cssText : 'position:absolute;left:80px;top:40px;',
            		                text: mstrmojo.desc(8748,"Are you sure you want to disconnect the selected database connections?"),            		                
            		            }]
            		        }).render();
				},
				onenabledChange: function(){ 
                    this.domNode.disabled = ! this.enabled;
                }
			}]
		}, {
			scriptClass : "mstrmojo.DataGrid",
			id : "DBConnectionTable",
			cssClass : 'mstrmojo-userconnectiontable',
			model : _sortAsc,
			lastDetailBtn : null,
			waiting : false,
			listSelector: mstrmojo.ListSelector,
			numSelected:0,
			makeObservable : true,
			sort : function(prop, asc) {
				var sortFunc = function mySort(p, s) {
					return function(a, b) {
						var aProp = eval("a." + p), bProp = eval("b." + p);
						var e = aProp == bProp;
						var r = aProp > bProp;
						/* wxu use EMCA standard return value */
						if(s) {
							if(e) {
								return 0;
							} else if(r) {
								return 1;
							} else {
								return -1;
							}
						} else {
							if(e) {
								return 0;
							} else if(r) {
								return -1;
							} else {
								return 1;
							}
						}
					};
				};
				if(this.items) {
					this.items.sort(sortFunc(prop, asc));
					var num = this.numSelected;
					this.render();
					this.set("numSelected", num);
				}
			},
			columns : [{
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:12em",
					text : mstrmojo.desc(8672,"Connection ID"),
					dataField : "ConnectionId",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				//dataField: "ConnectionId"
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						var p = this.data.ConnectionId;
						this.text = p + " ";
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:13em",
					text : mstrmojo.desc(8676,"Database Instance"),
					dataField : "DBInstanceName",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						var p = this.data.DBInstanceName;
						if(p) {
							p = p.replace(">", "&gt;")
							p = p.replace("<", "&lt;")
						}

						this.text = p;
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:6em",
					text : mstrmojo.desc(8726,"Status"),
					dataField : "DBConnectionStatus",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				dataWidget : {
					scriptClass : "mstrmojo.Label",
					postApplyProperties : function() {
						this.text = _getStatus(this.data.DBConnectionStatus);
						var lastId = mstrmojo.all.IPADBConnectionTable.lastSelectedConnectionID;
						if(lastId && lastId == this.data.ConnectionId) {
							this.dataGrid.set("selectedIndex", this.idx);
						}
					}
				}
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:13em",
					text : mstrmojo.desc(8675,"Database Connection"),
					dataField : "DBConnection",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				dataField : "DBConnection"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.IPA.CustomHeader',
					cssText : "margin-left:auto;margin-right:auto;width:5em",
					text : mstrmojo.desc(8735,"User"),
					dataField : "Username",
					postCreate : function() {
						this.set("model", _sortAsc);
					}
				},
				dataField : "Username"
			}, {
				headerWidget : {
					scriptClass : 'mstrmojo.ImageCheckBox',
					label : '',
					visible : true,
					postBuildRendering: function() {
						if (this._super) {
                        	return this._super();
                        } 
						
						if(this.dataGrid.numSelected == 0){
								this.checked=false;
								this.inputNode.src = '../images/check_off.gif';
							}else if (this.dataGrid.numSelected == this.dataGrid.items.length) {
								this.checked=true;
								this.inputNode.src = '../images/check_on.gif';
							}else{
								this.inputNode.src = '../images/Check_conflict.gif';
							}
						
										 
                        return true;
                    },
					postCreate: function(){
						this.dataGrid.checkAllBox = this;
					},
					oncheckedChange : function() {
						var c = this.checked;
						for(var i = 0; i < this.dataGrid.items.length; i++) {
								this.dataGrid.items[i].set("selected", c);
						}
					
						if(c){
							this.dataGrid.numSelected = this.dataGrid.items.length;
							this.inputNode.src = '../images/check_on.gif';
						}else{
							this.dataGrid.numSelected = 0;
							this.inputNode.src = '../images/check_off.gif';
						}
					}
				},
				colWidth: "70",
				dataWidget : {
					scriptClass : 'mstrmojo.CheckBox',
					label : '',
					visible : true,
					postApplyProperties : function() {
						if(!this.data.scriptClass) {
							this.dataGrid.items[this.idx] = new mstrmojo.Obj(this.data)
						}

						this.checked = this.data.selected;
						this.set("bindings", {
							checked : "mstrmojo.all.DBConnectionTable.items[" + this.idx + "].selected"
						});
					},
					oncheckedChange : function() {
						this.dataGrid.items[this.idx].selected = this.checked;
						
						if(this.checked == true){
							this.dataGrid.numSelected++;
						}else if( this.dataGrid.numSelected != 0){
							this.dataGrid.numSelected--;
						}
						var cb = this.dataGrid.checkAllBox;
						if(cb && cb.hasRendered){
							if(this.dataGrid.numSelected == 0){
								cb.checked=false;
								cb.inputNode.src = '../images/check_off.gif';
							}else if (this.dataGrid.numSelected == this.dataGrid.items.length) {
								cb.checked=true;
								cb.inputNode.src = '../images/check_on.gif';
							}else{
								cb.inputNode.src = '../images/Check_conflict.gif';
							}
						}
						
						if(this.dataGrid.numSelected == 0){
							mstrmojo.all.disconnectDBBtn.set("enabled", false);
						}else{        
							mstrmojo.all.disconnectDBBtn.set("enabled", true);
						}
					}
				}
			} ],
			onwaitingChange : function() {
				var table = mstrmojo.all.DBConnectionTable.itemsContainerNode.firstChild;
				if(this.waiting) {
					if(table) {
						var newRow = table.insertRow(0);
						newRow.setAttribute("class", "mstrmojo-DataRow");
						var td = document.createElement("td");
						td.setAttribute("colSpan", this.columns.length);
						td.setAttribute("style", "padding:0 0 0 10px");

						/* set waiting icon */
						var wi = mstrmojo.insert({
							scriptClass : "mstrmojo.WaitIcon",
							visible : true
						});
						wi.render();
						td.appendChild(wi.domNode);

						newRow.appendChild(td);
					}
				} else {
					if(table) {
						if(table.rows && table.rows.length > 0) {
							table.deleteRow(0);
						}

						var newRow = table.insertRow(0);
						newRow.setAttribute("class", "mstrmojo-DataRow");
						var td = document.createElement("td");
						td.setAttribute("colSpan", this.columns.length);
						td.setAttribute("style", "padding:0 0 0 10px");

						/* set waiting icon */
						var wi = mstrmojo.insert({
							scriptClass : "mstrmojo.Label",
							cssText : "text-align:center;",
							text : "No database connection found.",
							visible : true
						});
						wi.render();
						td.appendChild(wi.domNode);

						newRow.appendChild(td);
					}
				}
			},
			onchange : function() {
				var table = mstrmojo.all.IPADBConnectionTable;
				if(table && this.items && this.selectedIndex >= 0 && this.selectedIndex < this.items.length) {

					if(table.lastSelectedConnectionID != this.items[this.selectedIndex].Id) {
						table.lastSelectedConnectionID = this.items[this.selectedIndex].Id;
					}

					/* wxu scroll to selected row if it is not shown up*/
					var height = this.itemsContainerNode.offsetHeight;
					var visibleHeight = this.scrollboxNode.offsetHeight;
					var rowHeight = height / this.items.length;
					var scrollTo = height * (this.selectedIndex / this.items.length);
					if(scrollTo + rowHeight >= this.scrollboxNode.scrollTop + visibleHeight || scrollTo <= this.scrollboxNode.scrollTop) {
						this.scrollboxNode.scrollTop = scrollTo;
					}
				}
			}
		}]
	});

})();
